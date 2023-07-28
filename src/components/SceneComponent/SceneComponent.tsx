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
    const result = useLoader(SVGLoader, '/data/mapit2/floor-13.svg');
    const [meshParams, setMeshParams] = useState<any[]>([]);
    const consolePrefix = 'MAPIT2';
    const config = {
        WALL_THICKNESS: 0.6,
        BOUNDARY_COLOR: '888888',
        BOUNDARY_THICKNESS: 0.8,
        STORE_DEFAULT_COLOR: 'E2E2E2',
        STYLE: '2D',
    }
    const getWallShape = (...params: any) => {

    }
    useEffect(() => {
        if (result && result.paths && result.paths.length) {
            const pathIds = [];
            for (let i = 0; i < result.paths.length; i++) {
                pathIds.push(result.paths[i]?.userData?.node.id);
            }
					const paths = result.paths;
					for (var i = 0; i < paths.length; i++) {
						let path = paths[i];
						let mesh_type = null as string | null;
						let layer_color = path.color as Color | string;
						let extrude = 0;
						let z_index = 0;
						let mesh_visible = true;
						let mesh_draw = true;
						let mesh_transparent = false;
						let line_thickness = config.WALL_THICKNESS;
						let interactiveMesh = true;
						var layer_name = path.userData?.node.id;
                        if (layer_name != undefined) {
                            if (layer_name.startsWith('store')) {
                                mesh_type = 'store';
                                layer_color = config.STORE_DEFAULT_COLOR;
                                if (config.STYLE == '3D') {
                                    extrude = 8;
                                }
                                if (layer_name.startsWith('store-underlay')) {
                                    interactiveMesh = false;
                                }
                            }
                            if (mesh_draw) {
                                let material_settings = {
                                    color: layer_color,
                                    side: DoubleSide,
                                    transparent: true,
                                } as any;
                                if (config.STYLE === '2D' || mesh_type === 'base' || mesh_type == null) {
                                    if (mesh_type !== 'boundary') {
                                        material_settings.depthWrite = false;
                                        material_settings.depthTest = false;
                                    }
                                }
                                let material = new MeshLambertMaterial(material_settings);
                                if (['store', 'big-store', 'kiosk', 'amenity'].includes(mesh_type as string)) {
                                    //@ts-ignore
                                    material.colorDefault = material.color;
                                    // if (allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].bg_color != '') {
                                    //     material.color = hex_to_color(allIndexedMapObjects[layer_name].bg_color);
                                    //     material.colorDefault = material.color;
                                    // }
                                    //@ts-ignore
                                    material.active = false;
                                }
                                const shapes = path.toShapes(true);
                                let extrude_meshes;
                                if (config.STYLE == '2D') {
                                    extrude_meshes = ['building-base'];
                                } else {
                                    extrude_meshes = ['store', 'big-store', 'base', 'building-base'];
                                }

                                let wall_meshes = ['wall', 'outer-wall', 'boundary'];

                                let geometry;
                                if (extrude_meshes.includes(mesh_type as string)) {
                                    geometry = new ExtrudeGeometry(shapes, {
                                        depth: extrude,
                                        bevelEnabled: false,
                                    });
                                } else if (wall_meshes.includes(mesh_type as string)) {
                                    const wall_geometries = [] as any;
                                    path.subPaths.forEach(subPath => {
                                        subPath.curves.forEach(curve => {
                                            if (curve.type == 'LineCurve') {
                                                let shape_extend = 0;
                                                if (mesh_type == 'boundary') {
                                                    shape_extend = 1;
                                                } else if (mesh_type == 'wall') {
                                                    // shape_extend = 1 / 3;
                                                }
                                                let shape1 = getWallShape(curve, line_thickness, shape_extend);
                                                //@ts-ignore
                                                let wall_geometry = new THREE.ExtrudeBufferGeometry(shape1, {
                                                    depth: extrude,
                                                    bevelEnabled: false,
                                                });
                                                wall_geometries.push(wall_geometry);
                                            } else {
                                                console.warn(consolePrefix + '"%s" found in walls. Check layer "%s"', curve.type, layer_name);
                                            }
                                        });
                                    });

                                    if (wall_geometries.length == 1) {
                                        geometry = wall_geometries[0];
                                    } else if (wall_geometries.length > 1) {
                                        // geometry = BufferGeometryUtils.mergeBufferGeometries(wall_geometries);
                                    } else {
                                        console.warn(consolePrefix + 'Unneccessary wall exists "%s"', layer_name);
                                    }
                                } else {
                                    geometry = new ShapeGeometry(shapes);
                                    //@ts-ignore
                                    if (geometry.faces && geometry.faces.length == 0) {
                                        console.warn(consolePrefix + 'Unneccessary map shape "%s"', layer_name, path?.userData?.node);
                                    }
                                }
                                // setMeshMaterial(material);
                                // setMeshGeometry(geometry);
                                meshParams.push({material, geometry});
                                setMeshParams([...meshParams]);
                            }
                        }
                    }
        }
        console.log('SVGLOADER', {result})
    }, [result]);
    console.debug('PARAMS', { meshParams });
    return (
        <>
            {meshParams.map(params => (
                // <mesh {...params} rotation={[.3, .3, 0]} />
                <mesh
                    visible
                    userData={{ hello: 'world' }}
                    position={params.geometry.position}
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
            <perspectiveCamera fov={75} near={0.1} far={10000}/>
            <ambientLight intensity={1} color={'0xc4c4c4'} />
            <CameraControls />
            <directionalLight intensity={0.3} color={'0xffffff'} position={new Vector3(0, 400, 0)} />
            <directionalLight intensity={0.2} color={'0xc4c4c4'} position={new Vector3(0, 0, 400)} />
            <directionalLight intensity={0.2} color={'0xc4c4c4'} position={new Vector3(0, 0, -400)} />
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
