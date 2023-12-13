import {getMeshParams} from "./getMeshParams";
// import {SVGResult} from "three/examples/jsm/loaders/SVGLoader";
import { SVGResult } from "three-stdlib";
import {IConfig, IFloorData, IMeshValues, TMapMode, TRoles} from "src/types";
import {allIndexedMapObjects, allIndexedRetailers, allNodesFloor, pathFinderGraph} from "src/globals";
import {getMaterialAndGeometry} from "./getMaterialAndGeometry";
import {Raycaster} from "three";
import {assign_route_nodes_to_stores, linkFloorEscalators} from "src/helpers/route.helpers";

// TODO: get rid of this global variable
let node_count = 0;

export function loadFloors(floors:IFloorData[], config:IConfig, results:SVGResult[], role?: TRoles) {
    const GeometriesAndMaterials: Array<IMeshValues[]> = [];
    const escalator_nodes: string[] = [];
    results.forEach((result, floor_index) => {
        if (result.paths && result.paths.length) {
            const pathIds = [];
            for (let i = 0; i < result.paths.length; i++) {
                pathIds.push(result.paths[i]?.userData?.node.id);
            }
            const paths = result.paths;
            for (let i = 0; i < paths.length; i++) {
                const {
                    mesh_type,
                    layer_color,
                    extrude,
                    z_index,
                    mesh_visible,
                    mesh_draw,
                    mesh_transparent,
                    line_thickness,
                    interactiveMesh,
                    path,
                    layer_name,
                } = getMeshParams(
                    paths[i],
                    paths,
                    floors,
                    floor_index,
                    config,
                    ++node_count,
                    //@ts-ignore
                    allNodesFloor,
                    pathFinderGraph
                );

                if (mesh_draw) {
                    const meshParams = getMaterialAndGeometry(
                        config,
                        mesh_type,
                        layer_name,
                        layer_color,
                        mesh_transparent,
                        mesh_visible,
                        z_index,
                        extrude,
                        line_thickness,
                        floors,
                        floor_index,
                        allIndexedMapObjects,
                        allIndexedRetailers,
                        path,
                        role
                    );

                    if (layer_name.startsWith('kiosk-')) {
                        if (role === 'PORTAL') {
                            meshParams.mesh.visible = false;
                            //@ts-ignore
                            meshParams.mesh.material.visible = false;
                        }
                    }

                    if (!GeometriesAndMaterials[floor_index]) {
                        GeometriesAndMaterials[floor_index] = [];
                    }

                    GeometriesAndMaterials[floor_index].push(meshParams);
                }
            }
            const findStoreNodeRaycaster = new Raycaster();
            const routeNodeIds = assign_route_nodes_to_stores(
                floor_index,
                floors,
                allIndexedMapObjects,
                allIndexedRetailers,
                allNodesFloor,
                escalator_nodes,
                findStoreNodeRaycaster,
                config.ROLE
            );

            if (routeNodeIds.size && GeometriesAndMaterials[floor_index].length) {
                for (let i = 0; i < GeometriesAndMaterials[floor_index].length; i++) {
                    if (routeNodeIds.has(GeometriesAndMaterials[floor_index][i].mesh.object_id)) {
                        GeometriesAndMaterials[floor_index][i].mesh.route_node_id = routeNodeIds.get(GeometriesAndMaterials[floor_index][i].mesh.object_id);
                    }
                }
            }

            linkFloorEscalators(floors, pathFinderGraph);

        }
    })

    return { GeometriesAndMaterials, graph: pathFinderGraph, escalator_nodes};
}