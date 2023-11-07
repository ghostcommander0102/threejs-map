import {IConfig, IExtMesh, IFloorData, IJsonConfig, IMeshParams, TMapMode} from "../../types";
import {Map} from "./Map";
import React, {MouseEventHandler, useCallback, useEffect, useRef, useState} from "react";
import {Group, Mesh, PerspectiveCamera, Vector3} from "three";
import {ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import {get_camera_focus_object} from "../../helpers/camera.helpers";
import {MapControls} from "@react-three/drei";
import {create_route, make_amenity_route} from "../../helpers/route.helpers";
import {allIndexedMapObjects} from "../../globals";
import { IZoomData } from "./SceneComponent";

interface IFloorsMapProps {
    meshFloors: IMeshParams;
    currentFloorIndex: number;
    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    onCameraMove?: (e: any) => void;
    currKioskObj?: Mesh;
    routeTargetId?: string;
    amenityTargetType: string;
    activeObjectId?: string;
    hoverObjectId?: string;
    handleChangeFloor: (index: number) => MouseEventHandler<HTMLDivElement>,
    escalatorNodes: string[];
    zoom: IZoomData | null;
    handleCameraLength?: (length: number) => void;
    config: IConfig;
}


export const FloorsMap = (params:IFloorsMapProps) => {
    const { meshFloors, currentFloorIndex, currKioskObj, routeTargetId, amenityTargetType, handleChangeFloor, escalatorNodes, zoom, handleCameraLength, config } = params;
    const { floors } = meshFloors;

    const groupRef = useRef<Group>(null);
    const [ routeTubes, setRouteTubes ] = useState<Mesh[]>([]);
    const mapControlRef = useRef<any>(null);
    const { camera, scene } = useThree();
    const cameraFocus = useRef<{
        position:Vector3, target:Vector3,
        fromPosition:Vector3, fromTarget:Vector3,
        animationStartTime:number, duration:number } | null>(null);
    // const cameraFocus = useRef<{ position:Vector3, target:Vector3, animationStartTime:number, cameraTime:number, targetTime:number } | null>(null);

    const style = meshFloors.config.STYLE;
    const accentColor = meshFloors.config.ACCENT_COLOR;
    const pathFinderGraph = meshFloors.pathFinderGraph;
    //const from = (currKioskObj as IExtMesh).object_id;

    // useEffect(() => {
    //     if (!amenityTargetType || config.ROLE === 'PORTAL') {
    //         setRouteTubes([]);
    //         return;
    //     }
    //     const route = make_amenity_route(from?? '', amenityTargetType, scene, allIndexedMapObjects, pathFinderGraph, floors, escalatorNodes, style);
    //     setRouteTubes(route);
    // }, [amenityTargetType, scene, pathFinderGraph, floors, escalatorNodes, style, from])

    // useEffect(() => {
    //     if (!from || !routeTargetId || config.ROLE === 'PORTAL') {
    //         if (config.ROLE === 'PORTAL' && routeTargetId) {
    //             const targetMesh = scene.getObjectByProperty('object_id', routeTargetId);
    //             if (targetMesh) {
    //                 setRouteTubes([targetMesh as IExtMesh])
    //             }
    //         } else {
    //             setRouteTubes([]);
    //         }
    //         return;
    //     }
    //     if (!amenityTargetType) {
    //         floors.forEach(floor => {
    //             floor.escalatorMeshes = [];
    //         });
    //     }


    //     console.log('Make route from %s to %s', from, routeTargetId, pathFinderGraph);

    //     /* MAKE ROUTE PATH */

    //     const route = create_route(from, routeTargetId, scene, floors, meshFloors.escalator_nodes, pathFinderGraph, style);

    //     // TODO: activate object (moved out of create_route function)
    //     // makeObjectActive(to_mesh_object_id, accentColor, scene);

    //     // TODO: focus object (moved out of create_route function)
    //     // if (!routePaths.length) {
    //     //     let obj = scene.getObjectByProperty('object_id', to_mesh_object_id);
    //     //     const {position, target} =get_camera_focus_object([obj], camera.fov, camera.aspectRatio, '2D');
    //     //     camera.position.copy(position);
    //     // }


    //     setRouteTubes(route);

    // }, [ from, routeTargetId, scene, camera, floors, accentColor, pathFinderGraph, style, meshFloors.escalator_nodes ]);

    const selectedFloorMeshParams = meshFloors.meshParams[currentFloorIndex];
    useEffect(() => {
        if (!(camera instanceof PerspectiveCamera)) {
            console.error('Camera is not a PerspectiveCamera');
            return;
        }

        if (!selectedFloorMeshParams.length) {
            console.warn('objects not loaded yet');
            return;
        }

        let meshes:Mesh[];
        if (routeTubes[currentFloorIndex]) {
            meshes = [routeTubes[currentFloorIndex]];

            const currentActiveObject = routeTargetId && selectedFloorMeshParams.find(item => item.mesh.object_id === routeTargetId);
            if (currentActiveObject) {
                meshes.push(currentActiveObject.mesh);
            }
        } else {
            meshes = selectedFloorMeshParams.map(item => item.mesh);
        }

        const focus = get_camera_focus_object(meshes, camera.fov, camera.aspect, config.ROLE === 'PORTAL'? '2D' : style);
        const cameraDistance = Math.min(
            config.CAMERA.maxDistance,
            Math.max(
                config.CAMERA.minDistance,
                focus.position.distanceTo(focus.target)
            )
        );
        focus.position.sub(focus.target).setLength(cameraDistance).add(focus.target);

        cameraFocus.current = {
            ...focus,
            fromPosition: mapControlRef.current.object.position.clone(),
            fromTarget: mapControlRef.current.target.clone(),
            animationStartTime: performance.now(),
            duration: config.CAMERA.animSpeed, // how long it takes to move camera to get to new position
        };

        return () => {
            cameraFocus.current = null;
        };
    }, [routeTubes, selectedFloorMeshParams, currentFloorIndex, style, camera, routeTargetId, config.ROLE, config.CAMERA.maxDistance, config.CAMERA.minDistance, config.CAMERA.animSpeed]);

    useEffect(() => {
        if (zoom?.direction && mapControlRef.current) {
            const vector = new Vector3();
            vector.copy(mapControlRef.current.target);
            vector.sub(mapControlRef.current.object.position);
            vector.setLength(vector.length() * 0.4);

            if (zoom.direction === 'in') {
                camera.position.add(vector);
            } else {
                camera.position.sub(vector);
            }
        }
    }, [zoom])

    const onCameraMove = useCallback((e: any) => {
        if (handleCameraLength) {
            const vector = new Vector3();
            vector.copy(e.target.object.position);
            vector.sub(mapControlRef.current.target);
            handleCameraLength(vector.length());
        }
    }, [handleCameraLength])

    useFrame(() => {
        if (cameraFocus.current?.duration && cameraFocus.current?.duration > 0) {
            const focus = cameraFocus.current;
            const animationTime = (performance.now() - focus.animationStartTime)/1000;

            const animationProgress = Math.min(1, animationTime / focus?.duration);
            mapControlRef.current.object.position.lerpVectors(focus.fromPosition, focus.position, animationProgress);
            mapControlRef.current.target.lerpVectors(focus?.fromTarget, focus.target, animationProgress);

            mapControlRef.current.object.updateProjectionMatrix();
            if (animationProgress >= 1) {
                cameraFocus.current = null;
            }
        }
    })

    return (<group rotation={[Math.PI / 2, 0, 0]} ref={groupRef}>
        <>
            <MapControls
                makeDefault
                onChange={onCameraMove}
                ref={mapControlRef}
                maxPolarAngle={Math.PI / 2}
                minDistance={config.CAMERA.minDistance}
                maxDistance={config.CAMERA.maxDistance}
                />

            {floors && floors.map(( value: IFloorData, index: number) => (
                <Map
                    key={`Map-${index}`}
                    visible={currentFloorIndex === index}
                    floorIndex = {index}
                    currKioskObj={params.currKioskObj ?? null}
                    activeObjectId={params.activeObjectId}
                    hoverObjectId={params.hoverObjectId}
                    meshFloors={meshFloors}
                    routeTube={config.ROLE !== 'PORTAL'? routeTubes && routeTubes[index] : undefined}
                    onPointerEnter={params.onPointerEnter}
                    onPointerLeave={params.onPointerLeave}
                    onPointerMove={params.onPointerMove}
                    onClick={params.onClick}
                    handleChangeFloor={handleChangeFloor}
                />
            ))}
        </>
    </group>)
}