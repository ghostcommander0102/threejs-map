import React, {MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Canvas, ThreeEvent, useThree} from "@react-three/fiber";
import useMeshFloors, { textLogoNamePrefix } from "../../Hooks/useMeshFloors";
import {SceneProperties} from "./SceneProperties";
import {CameraProperties} from "./CameraProperties";
import {Mesh, Object3D} from "three";
import {IAmenitiesInteractiveList, IExtMesh, IJsonConfig, IMeshParams, TMapMode, TMapSettingsProps} from "src/types";
import {FloorsMap} from "./FloorsMap";
import {useMapit2Data} from "../../useMapit2Data";
import {MapIt2Response, MapObj} from "../../mapitApiTypes";
import { Stats } from '@react-three/drei';
import UIComponent from "../../components/UIComponent";
import {MapCenterMarker} from "./MapCenterMarker";
import { delete_route_path } from "src/helpers/route.helpers";
import { useMeshObjectContext } from "src/contexts/MeshObjectContextProvider";
import MapboxForm from "../../components/MapboxForm/MapboxForm";
import styles from '../../MapBox.module.css';
import {Alert} from 'react-bootstrap';

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
    APIUri?: string;
    mapitData?: MapIt2Response;
    config: Partial<IJsonConfig>;
    selectedActiveObjectId: string;
    setSelectedActiveObjectId: React.Dispatch<React.SetStateAction<string>>;
    onMapDataUpdate?: (data: MapObj[]) => void;
    onSettingsLoading?: (settings: MapIt2Response) => void;
}

export interface IZoomData {
    direction: 'in' | 'out';
}

export type TFormMapObjData = {
  index: number,
  data: MapObj,
}

const SceneComponent = (params:ISceneComponentProps) => {
    const data = useMapit2Data({ mapitData:params.mapitData, CENTER_ID: params.config.CENTER_ID as string, APIUri: params.APIUri as string});
    const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(-1);
    const [formMapObjData, setFormMapObjData] = useState<TFormMapObjData[]>([]);

    const { selectedActiveObjectId, setSelectedActiveObjectId, onMapDataUpdate } = params;

    const [amenityTargetType, setAmenityTargetType] = useState<string>('');
    const [zoom, setZoom] = useState<IZoomData | null>(null);

    const [cameraLength, setCameraLength] = useState<number>(0);

    const statsParentRef = useRef(null);

    const handleCameraLength = useCallback((length: number) => {
        setCameraLength(length);
    }, [])

    const handleFloorChange = (floorIndex: number): MouseEventHandler<HTMLDivElement> => (e) => {
        setSelectedFloorIndex(floorIndex);
    }


    const meshFloors = useMeshFloors(data, params.config, params.config.ROLE);
    const mapCenterMarkerRef = useRef(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const [ currentHoveredObject, setCurrentHoveredObject ] = useState<Object3D | null>(null);
    const meshObjectContext = useMeshObjectContext();

    const config = meshFloors.config;
    const floors = meshFloors.floors;
    const meshParams = meshFloors.meshParams;

    useEffect(() => {
        if (data && meshFloors.config && params.onSettingsLoading) {
            params.onSettingsLoading(
                {
                    ...data,
                    settings: {
                        ...data.settings,
                        ACCENT_COLOR: meshFloors.config.ACCENT_COLOR.getHexString(),
                        AMENITIES_NAV_BG_COLOR: meshFloors.config.AMENITIES_NAV_BG_COLOR.getHexString(),
                        AMENITIES_NAV_ICON_COLOR: meshFloors.config.AMENITIES_NAV_ICON_COLOR.getHexString(),
                        BASE_COLOR: meshFloors.config.BASE_COLOR.getHexString(),
                        BIG_STORE_DEFAULT_COLOR: meshFloors.config.BIG_STORE_DEFAULT_COLOR.getHexString(),
                        BOUNDARY_COLOR: meshFloors.config.BOUNDARY_COLOR.getHexString(),
                        BOUNDARY_THICKNESS: meshFloors.config.BOUNDARY_THICKNESS.toString(),
                        MAP_BACKGROUND_COLOR: meshFloors.config.MAP_BACKGROUND_COLOR.getHexString(),
                        OVERLAY_COLOR: meshFloors.config.OVERLAY_COLOR.getHexString(),
                        OVERLAY_OPACITY: meshFloors.config.OVERLAY_OPACITY.toString(),
                        STORE_DEFAULT_COLOR: meshFloors.config.STORE_DEFAULT_COLOR.getHexString(),
                        STORE_TEXT_COLOR: meshFloors.config.STORE_TEXT_COLOR.getHexString(),
                        WALL_COLOR: meshFloors.config.WALL_COLOR.getHexString(),
                        WALL_THICKNESS: meshFloors.config.WALL_THICKNESS.toString(),
                        KIOSK_SIZE: meshFloors.config.KIOSK_SIZE? meshFloors.config.KIOSK_SIZE : '15',
                    }
                });
        }
    }, [data, meshFloors])


    // if selectedActiveObjectId is not -1, then it is set to the DEFAULT_SELECTED_STORE
    let activeObjectId = config?.DEFAULT_SELECTED_STORE ?? '';
    if (selectedActiveObjectId) {
        activeObjectId = selectedActiveObjectId;
    } else if (amenityTargetType) {
        activeObjectId = '';
    }

    const handleChangeMapitData = (index: number, newData: MapObj) => {
        const itemIndex = formMapObjData.findIndex((item) => item.data.id === newData.id);

        if (itemIndex !== -1) {
            formMapObjData[itemIndex] = { index, data: { ...newData } };
        } else {
            formMapObjData.push({ index, data: { ...newData } })
        }

        setFormMapObjData([...formMapObjData]);
    }

  const getMapitData = (): MapIt2Response | null => {
    if (data && data.map_objs) {
      if (formMapObjData) {
        formMapObjData.forEach((value) => {
          const index = data.map_objs.findIndex((item: MapObj) => item.id === value.data.id);
          if (index !== -1) {
            data.map_objs[index] = { ...value.data };
          }
        })
      }
    }

    return data;
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
            if (config.ROLE === 'WEBSITE') {
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
        const currKioskLogo = currKioskObj? meshFloors.storeLogos.flat().find(storeLogo => storeLogo.storeLogo.object_id === 'custom-layer-' + (currKioskObj as IExtMesh).object_id)?.storeLogo : null;
        if (currKioskLogo && config?.ROLE !== 'PORTAL' && config) {
            const koef = cameraLength/(config.CAMERA.maxDistance - config.CAMERA.minDistance);
            currKioskLogo.userData.htmlContent = <MapCenterMarker size={Number(config.KIOSK_SIZE)} koef={1-koef} />
            currKioskLogo.position.z = -(koef*80);
            meshFloors.storeLogos.flat().map(storeLogo => {
                if (storeLogo.storeLogo.object_id === currKioskLogo.object_id) {
                    storeLogo.storeLogo.visible = false;
                }
                return null;
            })
        }
        return () => {
            if (currKioskLogo) {
                currKioskLogo.userData.htmlContent = null;
            }
        }
    }, [meshFloors, currKioskObj, cameraLength]);

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

    useEffect(() => {
        if (onMapDataUpdate) {
            const exportData: MapObj[] = [];

            formMapObjData.forEach((value) => {
                exportData.push({...value.data});
            })
        }
    }, [formMapObjData])

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
        console.warn('Config', config)
        console.warn('MeshFloors', meshFloors)
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
            {config.ROLE === 'PORTAL' &&
                <div className={styles['mapbox-admin-form']}>
                    {!selectedActiveObjectId? 
                    <Alert variant="info">Select a store to customize.</Alert>
                    :
                        <MapboxForm
                            floorIndex={currentFloorIndex}
                            meshFloors={meshFloors}
                            config={config}
                            data={getMapitData()}
                            setData={handleChangeMapitData}
                            selectedId={selectedActiveObjectId}
                            centerId={params.config.CENTER_ID as string}
                        />
                    }
                </div>
            }
            <div ref={statsParentRef} style={{ position: 'relative', width: '100%' }}>
                <UIComponent accentColor={config.ACCENT_COLOR.getStyle()} floors={floors} selectedFloorIndex={currentFloorIndex} handleFloorChange={handleFloorChange} amenitiesList={amenitiesList} handleAmenityClick={handleAmenityClick} reset={resetHandle} zoomIn={() => setZoom({ direction: 'in' })} zoomOut={() => setZoom({ direction: 'out' })} role={config.ROLE} />
                <Canvas style={{position: 'absolute', top: 0, left: 0}} flat>
                    {Number(params.config.STATS)? <Stats className={styles.stats} parent={statsParentRef} /> : null }
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
                        handleCameraLength={handleCameraLength}
                        config={config}
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
