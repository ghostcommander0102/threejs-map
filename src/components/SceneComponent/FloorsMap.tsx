import {IExtMesh, IFloorData, IMeshParams} from "../../Hooks/useMeshFloors/types";
import {Map} from "./Map";
import React, {MouseEventHandler, useCallback, useEffect, useRef, useState} from "react";
import {Group, Mesh, PerspectiveCamera, Vector3} from "three";
import {ThreeEvent, useThree} from "@react-three/fiber";
import {get_camera_focus_object} from "../../helpers/camera.helpers";
import {MapControls} from "@react-three/drei";
import {create_route, make_amenity_route} from "../../helpers/route.helpers";
import {allIndexedMapObjects} from "Hooks/useMeshFloors/globals";

interface IFloorsMapProps {
    meshFloors: IMeshParams;
    currentFloorIndex: number;
    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    onCameraMove?: (e: any) => void;
    currKioskObj: Mesh;
    routeTargetId?: string;
    amenityTargetType: string;
    activeObjectId?: string;
    hoverObjectId?: string;
    handleChangeFloor: (index: number) => MouseEventHandler<HTMLDivElement>,
    escalatorNodes: string[];
}


export const FloorsMap = (params:IFloorsMapProps) => {
    const { meshFloors, currentFloorIndex, currKioskObj, routeTargetId, amenityTargetType, handleChangeFloor, escalatorNodes } = params;
    const { floors } = meshFloors;

    const groupRef = useRef<Group>(null);
    const [ routeTubes, setRouteTubes ] = useState<Mesh[]>([]);
    const mapControlRef = useRef<any>(null);
    const { camera, scene } = useThree();
    const cameraFocus = useRef<{ position:Vector3, target:Vector3, animationStartTime:number, cameraTime:number, targetTime:number } | null>(null);

    const style = meshFloors.config.STYLE;
    const accentColor = meshFloors.config.ACCENT_COLOR;
    const pathFinderGraph = meshFloors.pathFinderGraph;
    const from = (currKioskObj as IExtMesh).object_id;

    useEffect(() => {
        if (!amenityTargetType) {
            setRouteTubes([]);
            return;
        }
        const route = make_amenity_route(from?? '', amenityTargetType, scene, allIndexedMapObjects, pathFinderGraph, floors, escalatorNodes, style);
        setRouteTubes(route);
    }, [amenityTargetType, scene, pathFinderGraph, floors, escalatorNodes, style, from])

    useEffect(() => {
        if (!from || !routeTargetId) {
            setRouteTubes([]);
            return;
        }
        if (!amenityTargetType) {
            floors.forEach(floor => {
                floor.escalatorMeshes = [];
            });
        }


        console.log('Make route from %s to %s', from, routeTargetId, pathFinderGraph);

        /* MAKE ROUTE PATH */

        const route = create_route(from, routeTargetId, scene, floors, meshFloors.escalator_nodes, pathFinderGraph, style);

        // TODO: activate object (moved out of create_route function)
        // makeObjectActive(to_mesh_object_id, accentColor, scene);

        // TODO: focus object (moved out of create_route function)
        // if (!routePaths.length) {
        //     let obj = scene.getObjectByProperty('object_id', to_mesh_object_id);
        //     const {position, target} =get_camera_focus_object([obj], camera.fov, camera.aspectRatio, '2D');
        //     camera.position.copy(position);
        // }


        console.log('new route', route)
        setRouteTubes(route);

    }, [ from, routeTargetId, scene, camera, floors, accentColor, pathFinderGraph, style, meshFloors.escalator_nodes ]);

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

        const cameraSpeed = 0.1; // per second
        const targetSpeed = 0.1;
        const focus = get_camera_focus_object(meshes, camera.fov, camera.aspect, style);
        const distance = mapControlRef.current.object.position.distanceTo(focus.position);
        const targetDistance = mapControlRef.current.target.distanceTo(focus.target);
        cameraFocus.current = {
            ...focus,
            animationStartTime: performance.now(),
            cameraTime: targetDistance/cameraSpeed/1000, // how long it takes to move camera to get to new position
            targetTime: targetDistance/targetSpeed/1000, // how long it takes to move camera to get to new position
        };
        // console.log({focus, meshes, camera});


        mapControlRef.current.target.copy(focus.target);
        mapControlRef.current.object.position.copy(focus.position);
        mapControlRef.current.object.lookAt(focus.target);
        mapControlRef.current.object.updateProjectionMatrix();


        return () => {
            cameraFocus.current = null;
        };
    }, [ routeTubes, selectedFloorMeshParams, currentFloorIndex, style, camera, routeTargetId ]);

    const onCameraMove = useCallback((e: any) => {
        // console.warn('onCameraMove', e);
        // debugger
        cameraFocus.current = null;
    }, [])

    // useFrame(() => {
    //     if (cameraFocus.current) {
    //         console.log('animate camera')
    //         const focus = cameraFocus.current;
    //         const animationTime = performance.now() - focus.animationStartTime;
    //         const cameraProgress = Math.min(1, animationTime / focus.cameraTime);
    //         const targetProgress = Math.min(1, animationTime / focus.targetTime);
    //         console.log({cameraProgress, targetProgress, animationTime, focus});
    //
    //         mapControlRef.current.target.lerp(focus.target, targetProgress);
    //         mapControlRef.current.object.position.lerp(focus.position, cameraProgress);
    //         mapControlRef.current.object.lookAt(focus.target);
    //         mapControlRef.current.object.updateProjectionMatrix();
    //
    //         if (cameraProgress === 1 && targetProgress === 1) {
    //             cameraFocus.current = null;
    //         }
    //     }
    // })

    return (<group rotation={[Math.PI / 2, 0, 0]} ref={groupRef}>
        <>
            <MapControls

                onChange={onCameraMove}
                ref={mapControlRef}
                maxPolarAngle={Math.PI / 2}
                />

            {floors && floors.map(( value: IFloorData, index: number) => (
                <Map
                    key={`Map-${index}`}
                    visible={currentFloorIndex === index}
                    floorIndex = {index}
                    currKioskObj={params.currKioskObj}
                    activeObjectId={params.activeObjectId}
                    hoverObjectId={params.hoverObjectId}
                    meshFloors={meshFloors}
                    routeTube={routeTubes && routeTubes[index]}
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