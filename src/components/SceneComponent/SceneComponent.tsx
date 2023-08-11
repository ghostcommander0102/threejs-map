import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import { Canvas, useLoader, useThree, extend, useFrame } from "@react-three/fiber";
import useMeshFloors from "Hooks/useMeshFloors";
import {SceneProperties} from "./SceneProperties";
import {Map} from "./Map";
import {CameraProperties} from "./CameraProperties";

const SceneComponent = () => {
    const {config, meshParams, textParams, storeLogos, drawText} = useMeshFloors('');
    console.debug({textParams});
    if (!meshParams.length) {
        console.warn('LOADING MAP')
        return <div>Loading Map</div>
    } else {
        console.warn('RENDERING MAP', meshParams.length)
        return (
            <Canvas onClick={state => console.debug({state})}>
                <SceneProperties background={'gray'} />
                <CameraProperties far={10000} />
                <axesHelper args={[1000]} />


                <ambientLight intensity={1} color={'0xc4c4c4'} />


                <group scale={0.1} rotation={[Math.PI/2,0,0]}>
                    <Map config={config} meshParams={meshParams} textParams={textParams} storeLogos={storeLogos} />
                </group>
            </Canvas>
        )
    }
};

export default SceneComponent;
