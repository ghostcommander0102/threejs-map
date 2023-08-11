import {IConfig, IExtMesh, IMeshValues} from "../../Hooks/useMeshFloors/types";
import {useFrame, useThree} from "@react-three/fiber";
import React, {useLayoutEffect, useRef, useState} from "react";
import {Group, Mesh, PerspectiveCamera, Vector3} from "three";
import {get_camera_focus_object} from "../../helpers/camera.helpers";
import {MapControls} from "@react-three/drei";

export const Map = ({config, meshParams, textParams, storeLogos }: { config: IConfig, meshParams: IMeshValues[], textParams: { textMesh:IExtMesh }[], storeLogos: {storeLogo: IExtMesh}[] }) => {
    const { camera } = useThree();
    const [target, setTarget] = useState<Vector3>(new Vector3(0, 0, 0));
    console.debug({storeLogos});

    const mapControlRef = useRef<any>(null);
    const groupRef = useRef<Group>(null);
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
                return <group onClick={(o) => { console.log('CLICK', o.object)}}><primitive key={params.mesh.uuid} object={params.mesh}></primitive></group>
            })}
            {textParams.map((params, index) => {
                if (!params.textMesh) return null;
                return <primitive key={params.textMesh.uuid} object={params.textMesh}></primitive>
            })}
            {storeLogos.map((params, index) => {
                if (!params.storeLogo) return null;
                return <primitive key={params.storeLogo.uuid} object={params.storeLogo}></primitive>
            })}
        </group>
    )
}