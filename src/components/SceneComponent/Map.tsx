import {IConfig, IExtMesh, IMeshValues} from "../../Hooks/useMeshFloors/types";
import {ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import React, {RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Group, Mesh, Object3D, PerspectiveCamera, RGB, Vector3} from "three";
import {get_camera_focus_object} from "../../helpers/camera.helpers";
import {Html, MapControls} from "@react-three/drei";
import useYouAreHereMarker from "Hooks/useYouAreHereMarker";
import { create_route } from "helpers/route.helpers";

export const Map = ({config, meshParams, textParams, storeLogos, labelRef, floors, accentColor, pathFinderGraph }: { config: IConfig, meshParams: IMeshValues[], textParams: { textMesh:IExtMesh }[], storeLogos: {storeLogo: IExtMesh}[], labelRef?: RefObject<HTMLElement>, floors: any, accentColor: any, pathFinderGraph: any }) => {
    const { camera, scene } = useThree();
    const [target, setTarget] = useState<Vector3>(new Vector3(0, 0, 0));
    const [currKioskObj, setCurrKioskObj] = useState<Object3D | null>(null);
    const mapControlRef = useRef<any>(null);
    const groupRef = useRef<Group>(null);
    const [routeTube, setRouteTube] = useState<Object3D | null>(null);

    const handleRouteTube = (obj: Object3D) => {
        if (obj) {
            setRouteTube(obj);
        }
    }
    useYouAreHereMarker({currKioskObj, mapCenterMarker: document.querySelector('#mapCenterMarker'), camera});

	const getDarkerColor = (color: RGB) => {
		if (color) {
			var newColor = { ...color }
			newColor.r = color.r * 0.92;
			newColor.g = color.g * 0.92;
			newColor.b = color.b * 0.92;
			return newColor;
		}
		return null;
	}


    const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (labelRef && labelRef.current && e.object.userData.storeName && e.object.userData.storeName !== '') {
            //@ts-ignore
            labelRef.current.innerHTML = e.object.userData.storeName;
            labelRef.current.style.top = `${e.offsetY-65}px`; 
            labelRef.current.style.left = `${e.offsetX}px`; 
            labelRef.current.style.display = 'block'; 
        }
    }, [labelRef]);

    const onPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        //@ts-ignore
        e.object.material.color = getDarkerColor(e.object.material.color);  
        document.body.style.cursor = 'pointer';
    }, [labelRef]);

    const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        // e.stopPropagation();
        if (currKioskObj && e.object) {
            /* MAKE ROUTE PATH */
            //@ts-ignore
            // create_route(currKioskObj.object_id, e.object.object_id, camera, scene, floors, accentColor, pathFinderGraph, handleRouteTube);
        }
    }, [currKioskObj, floors]);

    const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        //@ts-ignore
        e.object.material.color = e.object.material.colorDefault;  
        document.body.style.cursor = 'default';
        if (labelRef && labelRef.current) {
            labelRef.current.style.display = 'none';
        }
    }, [labelRef]);

    useEffect(() => {
        if (meshParams.length) {
            for (let i = 0; i < meshParams.length; i++) {
                if (meshParams[i].mesh && meshParams[i].mesh.mesh_type === 'kiosk') {
                    setCurrKioskObj(meshParams[i].mesh);
                    break;
                }
            }
        }
    }, [meshParams])
    useEffect(() => {
        console.debug({routeTube});
    }, [routeTube]);

    useLayoutEffect(() => {
        if (!groupRef.current) return;
        if (!(camera instanceof PerspectiveCamera)) return;

        const group = groupRef.current;
        const meshes = group?.children.filter(item => item instanceof Mesh) as Mesh[];
        const focus = get_camera_focus_object(meshes, camera.fov, camera.aspect, config.STYLE);

        console.log({focus, meshes, camera});

        if (mapControlRef.current) {
            console.log('SETTING MAP CONTROL')
            mapControlRef.current.target = focus.target;
            mapControlRef.current.object.position.copy(focus.position);
            mapControlRef.current.object.lookAt(focus.target);
        }
    }, []);

    useFrame(() => {

    });
    return (
        <group ref={groupRef}>
            <MapControls
                ref={mapControlRef}
                maxPolarAngle={Math.PI / 2}
                target={target} />

            {meshParams.map((params, index) => {
                if (!params.mesh) return null;
                return <group {...(['store', 'big-store'].includes(params.mesh.mesh_type as string)? {onPointerOver, onPointerMove, onPointerOut, onClick} : {})}><primitive key={params.mesh.uuid} object={params.mesh}></primitive>
                </group>
            })}
            {textParams.map((params, index) => {
                if (!params.textMesh) return null;
                return <primitive key={params.textMesh.uuid} object={params.textMesh}>
                </primitive>
            })}
            {storeLogos.map((params, index) => {
                if (!params.storeLogo) return null;
                return <primitive key={params.storeLogo.uuid} object={params.storeLogo}></primitive>
            })}
            {routeTube && <primitive object={routeTube}></primitive>}
        </group>
    )
}