import {IMeshParams, TRoles} from "../../types";
import {ThreeEvent} from "@react-three/fiber";
import React, {MouseEventHandler} from "react";
import {Mesh, MeshLambertMaterial, MeshStandardMaterial, RGB} from "three";
import {RouteTube} from "./RouteTube";
import {Html} from "@react-three/drei";
import styles from '../../MapBox.module.css';

interface IMapProps {
    floorIndex: number,
    meshFloors: IMeshParams;
    currKioskObj: Mesh | null;
    activeObjectId?: string;
    hoverObjectId?: string;
    routeTube?: Mesh;
    visible: boolean,
    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    handleChangeFloor: (index: number) => MouseEventHandler<HTMLDivElement>;
}

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

export const Map = (params: IMapProps) => {
    const {meshFloors, routeTube, floorIndex, activeObjectId, hoverObjectId, visible, handleChangeFloor} = params;

    const { config, meshParams, textParams, storeLogos} = meshFloors;
    const floor = meshFloors.floors[floorIndex];

    const onPointerMove = params.onPointerMove;
    const onPointerOver = params.onPointerEnter;
    const onPointerOut = params.onPointerLeave;
    const onClick = params.onClick;

    const floorMeshParams = meshParams[floorIndex];
    const floorTextParams = textParams[floorIndex];
    const floorStoreLogos = storeLogos[floorIndex];
    const escalatorMeshes = meshFloors.floors[floorIndex].escalatorMeshes;

    // console.log('Map', floorIndex, { meshParams, floorIndex, floorMeshParams, floorTextParams, floorStoreLogos, routeTubes})
    return (
        <group visible={visible}>
            {floorMeshParams?.map((params) => {
                if (!params.mesh) return null;

                const interactive = (visible && params.mesh.visible && floor.interactiveObjs && floor.interactiveObjs.includes(params.mesh));
                const hovered = hoverObjectId && params.mesh.object_id === hoverObjectId;
                const active = activeObjectId && params.mesh.object_id === activeObjectId;
                if (interactive) {
                    // TODO: move those colorDefault, active, etc to userData of mesh or material
                    if ((active || hovered) && (params.mesh.material instanceof MeshLambertMaterial || params.mesh.material instanceof MeshStandardMaterial)) {
                        // @ts-ignore
                        const baseColor = active ? config.ACCENT_COLOR : params.mesh.material.colorDefault;
                        //console.log('Map', {baseColor, active, hovered})
                        params.mesh.material.color = hovered ? getDarkerColor(baseColor) : baseColor;
                    } else {
                        // @ts-ignore
                        params.mesh.material.color = params.mesh.material.colorDefault;
                    }
                }

                return <group key={params.mesh.uuid} {...(interactive? {onPointerOver, onPointerMove, onPointerOut, onClick } : {})}>
                    <primitive object={params.mesh}></primitive>
                </group>
            })}
            {floorTextParams?.map((params) => {
                if (!params.textMesh) return null;
                return <primitive key={params.textMesh.uuid} object={params.textMesh}>
                </primitive>
            })}
            {floorStoreLogos?.map((params) => {
                if (!params.storeLogo) return null;

                return <primitive key={params.storeLogo.uuid} object={params.storeLogo}>
                    {visible && params.storeLogo.userData.htmlContent? <Html>{params.storeLogo.userData.htmlContent}</Html> : null}
                </primitive>
            })}
            {escalatorMeshes?.map((params) => {
                //@ts-ignore
                return <primitive key={`escalator-${params.object_id}`} object={params}>
                    <Html visible={false} position={params.geometry.boundingSphere?.center}>
                        <div onClick={handleChangeFloor(params.goToFloor?.index || 0)} id={styles.escalator_elems} style={{ display: visible ? 'block' : 'none' }}>
                            <div className={styles.element} id={params.object_id as string}>
                                <div className={styles.label}>{params.goToFloor?.direction}: Floor {params.goToFloor ? params.goToFloor.index + 1 : ''}</div>
                            </div>
                        </div>
                    </Html>
                </primitive>
            })}
            <RouteTube mesh={routeTube} />
        </group>
    )
}