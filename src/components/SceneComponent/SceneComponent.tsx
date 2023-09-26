import React, {MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Canvas, ThreeEvent, useThree} from "@react-three/fiber";
import useMeshFloors, { textLogoNamePrefix } from "Hooks/useMeshFloors";
import {SceneProperties} from "./SceneProperties";
import {CameraProperties} from "./CameraProperties";
import {Mesh, Object3D} from "three";
import {IAmenitiesInteractiveList, IExtMesh, IJsonConfig, IMeshParams, TMapMode} from "types";
import {FloorsMap} from "./FloorsMap";
import {useMapit2Data} from "../../useMapit2Data";
import {MapIt2Response, MapObj} from "../../mapitApiTypes";
import { Stats } from '@react-three/drei';
import UIComponent from "components/UIComponent";
import {MapCenterMarker} from "./MapCenterMarker";
import { delete_route_path } from "helpers/route.helpers";
import { useMeshObjectContext } from "contexts/MeshObjectContextProvider";
import MapboxForm from "components/MapboxForm/MapboxForm";
import styles from '../../MapBox.module.css';

const amenitiesList: IAmenitiesInteractiveList[] = [
    {
        name: 'ATM',
        type: 'atm',
        imageUrl: '/assets/threejs/assets/img/amenities/atm.svg?color=FFFFFF',
    },
    {
        name: 'Management',
        type: 'management',
        imageUrl: '/assets/threejs/assets/img/amenities/management.svg?color=FFFFFF',
    },
    {
        name: 'Kids Area',
        type: 'playarea',
        imageUrl: '/assets/threejs/assets/img/amenities/playarea.svg?color=FFFFFF',
    },
    {
        name: 'Restroom',
        type: 'restroom',
        imageUrl: '/assets/threejs/assets/img/amenities/restroom.svg?color=FFFFFF',
    },
    {
        name: 'Elevator',
        type: 'elevator',
        imageUrl: '/assets/threejs/assets/img/amenities/elevator.svg?color=FFFFFF',
    },
    {
        name: 'Security',
        type: 'security',
        imageUrl: '/assets/threejs/assets/img/amenities/security.svg?color=FFFFFF',
    },
] 

interface ISceneComponentProps {
    CENTER_ID?: string;
    mapitData?: MapIt2Response;
    config?: Partial<IJsonConfig>;
    stats?: boolean;
    selectedActiveObjectId: string;
    setSelectedActiveObjectId: React.Dispatch<React.SetStateAction<string>>;
    mode?: TMapMode;
    handleChangeMapitData: (index: number, data: MapObj) => void;
}

export interface IZoomData {
    direction: 'in' | 'out';
}

const SceneComponent = (params:ISceneComponentProps) => {
    const data = useMapit2Data({ mapitData:params.mapitData, CENTER_ID: params.CENTER_ID });
    const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(-1);

    const { selectedActiveObjectId, setSelectedActiveObjectId } = params;

    const [amenityTargetType, setAmenityTargetType] = useState<string>('');
    const [zoom, setZoom] = useState<IZoomData | null>(null);

    const handleFloorChange = (floorIndex: number): MouseEventHandler<HTMLDivElement> => (e) => {
        setSelectedFloorIndex(floorIndex);
    }

    const { mode, handleChangeMapitData } = params;

    const meshFloors = useMeshFloors(data, params.config, mode);
    const mapCenterMarkerRef = useRef(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const [ currentHoveredObject, setCurrentHoveredObject ] = useState<Object3D | null>(null);
    const meshObjectContext = useMeshObjectContext();

    const config = meshFloors.config;
    const floors = meshFloors.floors;
    const meshParams = meshFloors.meshParams;


    // if selectedActiveObjectId is not -1, then it is set to the DEFAULT_SELECTED_STORE
    let activeObjectId = config?.DEFAULT_SELECTED_STORE ?? '';
    if (selectedActiveObjectId) {
        activeObjectId = selectedActiveObjectId;
    } else if (amenityTargetType) {
        activeObjectId = '';
    }

    useEffect(() => {
        // console.log('useEffect currentHoveredObject', currentHoveredObject)
        document.body.style.cursor = currentHoveredObject? 'pointer' : 'default';
    }, [currentHoveredObject]);

    const [ currKioskObj, currKioskFloorIndex, kioskError ]: [ Mesh | null, number, string ] = useMemo(() => {
        if (!config) {
            return [ null, 0, '' ] // not an error - loading/initializing
        }
        let kioskError = '';
        let currKioskObj: Mesh | null = null;
        let currKioskFloorIndex = 0;
        if (config.KIOSKS && config.KIOSKS[config.KIOSK]) {
            const kioskMapObjName = config.KIOSKS[config.KIOSK].map_obj_name;
            const currKioskMeshParams = meshParams.flat().find(mesh => mesh.object_id === kioskMapObjName);
            if (currKioskMeshParams) {
                currKioskObj = currKioskMeshParams.mesh;
                currKioskFloorIndex = currKioskMeshParams.floor_index;
            }
        } else {
            if (config?.ROLE === 'WEBSITE') {
                kioskError = "This Kiosk is not assigned in MAP, so routes won't work. Please assign the Kiosk from Edit Map first.";
            }

            console.error('Kiosk not found in config');
            kioskError = 'Map initialization error';
        }

        return [ currKioskObj, currKioskFloorIndex, kioskError]
    }, [config, meshParams]);

    const resetHandle = () => {
        setSelectedFloorIndex(currKioskFloorIndex);
        setSelectedActiveObjectId('');
    }

    useEffect(() => {
        console.debug({meshFloors});
        const currKioskLogo = currKioskObj? meshFloors.storeLogos.flat().find(storeLogo => storeLogo.storeLogo.object_id === 'custom-layer-' + (currKioskObj as IExtMesh).object_id)?.storeLogo : null;
        if (currKioskLogo && mode !== 'edit') {
            currKioskLogo.userData.htmlContent = <MapCenterMarker />
        }
        return () => {
            if (currKioskLogo) {
                currKioskLogo.userData.htmlContent = null;
            }
        }
    }, [meshFloors, currKioskObj]);

    useEffect(() => {
        if (meshFloors.meshParams && meshFloors.meshParams.length && selectedActiveObjectId && meshObjectContext?.SetMeshObject) {
            const object = meshFloors.meshParams[selectedFloorIndex === -1? 0 : selectedFloorIndex].find((value) => value.object_id === selectedActiveObjectId);
            if (object) {
                //@ts-ignore
                handleMeshObjectContext(object);
            }
            //@ts-ignore
        }
    }, [meshFloors])

    const handleMeshObjectContext = (object: IExtMesh) => {
        if (meshObjectContext?.SetMeshObject) {
            const textParams = meshFloors.textParams[selectedFloorIndex === -1? 0 : selectedFloorIndex]?.find(value => {
                return value.textMesh.object_id === `${textLogoNamePrefix}${(object as IExtMesh).object_id}`
            })

            const logoParams = meshFloors.storeLogos[selectedFloorIndex === -1? 0 : selectedFloorIndex]?.find(value => {
                return value.storeLogo.object_id === `${textLogoNamePrefix}${(object as IExtMesh).object_id}`
            })

            const result = [object as IExtMesh];

            if (textParams) {
                result.push(textParams.textMesh);
            }

            if (logoParams) {
                result.push(logoParams.storeLogo)
            }

            meshObjectContext.SetMeshObject([...result]);
        }
    }

    const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        // console.log('onClick', e.object)

        const targetId = (e.object as IExtMesh).object_id;
        handleMeshObjectContext(e.object as IExtMesh);
        setSelectedActiveObjectId(targetId ?? '');
        // console.log('set active object', targetId);
        setAmenityTargetType('');
    }, [selectedFloorIndex, meshFloors.meshParams.length]);

    const handleAmenityClick = useCallback((type: string) => {
        setAmenityTargetType(type)
        setSelectedActiveObjectId('')
    }, []);

    const onCameraMove = useCallback((e: any) => {
        if (!mapCenterMarkerRef || !mapCenterMarkerRef.current) {
            return
        }
    }, []);

    const onPointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // console.log('onPointerEnter', e.object)
        if (!e.object.userData.storeName) {
            // console.warn('onPointerEnter no storeName', e.object);
            return;
        }
        setCurrentHoveredObject(e.object);
    }, []);

    const onPointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // console.log('onPointerLeave', e.object)
        setCurrentHoveredObject(null);
    }, []);

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // console.log('onPointerMove', e.object)

        if (labelRef && labelRef.current && e.object.userData.storeName && e.object.userData.storeName !== '') {
            labelRef.current.style.top = `${e.offsetY - 65}px`;
            labelRef.current.style.left = `${e.offsetX}px`;
            labelRef.current.style.display = 'block';
        }
    }

    if (!config || !meshFloors.meshParams.length) {
        console.warn('LOADING MAP')
        return <div>Loading Map</div>
    }

    if (kioskError) {
        return <div>{kioskError}</div>
    }

    const currentFloorIndex = selectedFloorIndex > -1 ? selectedFloorIndex : currKioskFloorIndex;

    if (!currKioskObj) {
        console.error('NO KIOSK OBJECT FOUND');
        return <div>Map initialization error</div>
    }

    // make sure that meshFloors conditionals are not null
    const meshFloorsChecked: IMeshParams = meshFloors as IMeshParams;


    let hoverObject = currentHoveredObject as IExtMesh
    let hoverObjectId = '';
    if (hoverObject && hoverObject.object_id) {
        hoverObjectId = hoverObject.object_id;
    }



    return (
        <>
            {mode === 'edit' &&
                <div className={styles['mapbox-admin-form']}>
                    <MapboxForm
                        floorIndex={currentFloorIndex}
                        meshFloors={meshFloors}
                        config={config}
                        data={data}
                        setData={handleChangeMapitData}
                        selectedId={selectedActiveObjectId}
                        centerId={params.CENTER_ID as string}
                    />
                </div>
            }
            <div style={{ position: 'relative' }}>
                <UIComponent accentColor={config.ACCENT_COLOR.getStyle()} floors={floors.length} selectedFloorIndex={currentFloorIndex} handleFloorChange={handleFloorChange} amenitiesList={amenitiesList} handleAmenityClick={handleAmenityClick} reset={resetHandle} zoomIn={() => setZoom({ direction: 'in' })} zoomOut={() => setZoom({ direction: 'out' })} mode={mode} />
                <Canvas flat>
                    {/* {params.stats? <Stats /> : null } */}
                    <SceneProperties background={config.MAP_BACKGROUND_COLOR} />
                    <CameraProperties near={1} far={10000} />
                    {/*<axesHelper args={[5000]} />*/}

                    <ambientLight intensity={1} color={'#c4c4c4'} />
                    <directionalLight position={[0, 400, 0]} color={'#ffffff'} intensity={0.3} />
                    <directionalLight position={[0, 0, 400]} color={'#c4c4c4'} intensity={0.2} />
                    <directionalLight position={[0, 0, -400]} color={'#c4c4c4'} intensity={0.2} />
                    <FloorsMap
                        onCameraMove={onCameraMove}
                        meshFloors={meshFloorsChecked}
                        activeObjectId={activeObjectId}
                        hoverObjectId={hoverObjectId}
                        currKioskObj={currKioskObj}
                        routeTargetId={activeObjectId}
                        currentFloorIndex={currentFloorIndex}
                        onPointerEnter={onPointerEnter}
                        onPointerLeave={onPointerLeave}
                        onPointerMove={onPointerMove}
                        onClick={onClick}
                        handleChangeFloor={handleFloorChange}
                        amenityTargetType={amenityTargetType}
                        escalatorNodes={meshFloors.escalator_nodes}
                        zoom={zoom}
                        mode={mode}
                    />
                </Canvas>
                <div ref={labelRef}
                    style={{
                        position: 'absolute',
                        padding: 10,
                        background: '#ffffff',
                        fontWeight: 600,
                        color: '#000000',
                        fontSize: 16,
                        display: currentHoveredObject ? 'block' : 'none',
                        top: 300,
                        left: 400,
                        opacity: .8,
                    }}
                >
                    <div>
                        {currentHoveredObject && currentHoveredObject.userData.storeName}
                    </div>
                </div>

            </div>
        </>
    )
};



export default SceneComponent;
