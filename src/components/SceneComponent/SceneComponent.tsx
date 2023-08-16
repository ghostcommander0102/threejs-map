import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import { Canvas, useLoader, useThree, extend, useFrame } from "@react-three/fiber";
import useMeshFloors from "Hooks/useMeshFloors";
import {SceneProperties} from "./SceneProperties";
import {Map} from "./Map";
import {CameraProperties} from "./CameraProperties";
import { MeshBasicMaterial, SphereGeometry, Mesh, Color } from "three";

const SceneComponent = () => {
    const {config, meshParams, textParams, storeLogos, drawText, floors, pathFinderGraph} = useMeshFloors('');
    const labelRef = useRef(null);
    const routePoints = [];
    if (floors && floors[0] && floors[0].route_points) {
        for (let i = 0; i < floors[0].route_points.length; i++) {
            const pointGeom = new SphereGeometry(10, 12, 12);
            const pointMesh = new Mesh(pointGeom, new MeshBasicMaterial({
                color: new Color(0.1, 0.1, 1),
            }));
            pointMesh.position.copy(floors[0].route_points[i].node);
            pointMesh.position.z = pointMesh.position.z - 20;
            pointMesh.renderOrder = 15;
            routePoints.push(pointMesh);
        }
    }
    console.debug({routePoints})
    if (!meshParams.length) {
        console.warn('LOADING MAP')
        return <div>Loading Map</div>
    } else {
        console.warn('RENDERING MAP', meshParams.length)
        return (
            <>
                <Canvas>
                    <SceneProperties background={'gray'} />
                    <CameraProperties far={10000} />
                    <axesHelper args={[1000]} />


                    <ambientLight intensity={1} color={'0xc4c4c4'} />


                    <group scale={0.1} rotation={[Math.PI / 2, 0, 0]}>
                        <Map config={config} meshParams={meshParams} textParams={textParams} storeLogos={storeLogos} labelRef={labelRef} floors={floors} accentColor={config.ACCENT_COLOR} pathFinderGraph={pathFinderGraph} />
                        {/* SHOW ROUTE DEBUG POINTS */}
                        {/* {routePoints.map(ptMesh => <primitive object={ptMesh}></primitive>)} */}
                    </group>
                </Canvas>
                <div ref={labelRef}
                    style={{
                        position: 'absolute',
                        padding: 10,
                        background: '#ffffff',
                        fontWeight: 600,
                        color: '#000000',
                        fontSize: 16,
                        display: 'none',
                        top: 300,
                        left: 400,
                        opacity: .8,
                    }}
                >
                    <div>
                        text title
                    </div>
                </div>
                <div id="mapCenterMarker"></div>
            </>
        )
    }
};

export default SceneComponent;
