import React, { useEffect, useRef, useState } from "react";
import { Canvas, useLoader, useThree, extend, useFrame } from "@react-three/fiber";
import {
    Color,
    Vector3,
    Euler,
    MeshBasicMaterial,
    BoxGeometry,
    ExtrudeGeometry,
    ShapeGeometry,
    MeshLambertMaterial,
    DoubleSide,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import useMeshFloors from "Hooks/useMeshFloors";

extend({OrbitControls});

const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls component.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  const {
    camera,
    gl: { domElement },
  } = useThree();

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();

  //@ts-ignore
  useFrame((state) => controls.current.update());
  //@ts-ignore
  return <orbitControls ref={controls} args={[camera, domElement]} />;
};

const Scene = () => {
    const { scene } = useThree();
    scene.background = new Color('gray');
    return null;
}

const Map = () => {
    const {meshParams} = useMeshFloors(''); 
    console.debug({meshParams});
    let geometry = meshParams[0]?.geometry;
    if (!geometry) return null;
    geometry.computeBoundingSphere();
    //@ts-ignore
    console.log({bs: geometry.boundingSphere});
    let material = meshParams[0].material;
    //@ts-ignore
    material.wireframe = true;
    return (
        <>
            <mesh
                // visible
                // userData={{ hello: 'world' }}
                // position={params.geometry.position}
                geometry={geometry}
            material={material}
            />
        </>
    );
    return (
        <>
            {meshParams.map((params, index) => (
                //<mesh key={`mesh-${index}`} {...params} rotation={[.3, .3, 0]} />
                <mesh
                    // visible
                    // userData={{ hello: 'world' }}
                    // position={params.geometry.position}
                    geometry={new BoxGeometry(.3, .3, .3)}
                    material={params.material}
                />
            ))}
        </>
    )
}

const SceneComponent = () => {
    return (
        <Canvas>
            <Scene />
            <perspectiveCamera fov={75} near={0.1} far={1000000}/>
            <CameraControls />
            {/*<Scene />
            <perspectiveCamera fov={75} near={0.1} far={10000}/>
            <ambientLight intensity={1} color={'0xc4c4c4'} />
            <CameraControls />
            <directionalLight intensity={0.3} color={'0xffffff'} position={new Vector3(0, 400, 0)} />
            <directionalLight intensity={0.2} color={'0xc4c4c4'} position={new Vector3(0, 0, 400)} />
    <directionalLight intensity={0.2} color={'0xc4c4c4'} position={new Vector3(0, 0, -400)} />*/}
            {/* <mesh
                visible
                userData={{ hello: 'world' }}
                position={new Vector3(0, 0, 0)}
                rotation={new Euler(Math.PI / 2, 0, Math.PI / 8)}
                geometry={new BoxGeometry(.3, .3, .3)}
                material={new MeshBasicMaterial({ color: new Color('magenta'), transparent: true })}
            /> */}
            <Map />
        </Canvas>
    )
};

export default SceneComponent;
