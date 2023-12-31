// import {SVGResultPaths} from "three/examples/jsm/loaders/SVGLoader";
import { SVGResultPaths } from "three-stdlib";
import {Graph} from "ngraph.graph";
import {Color, LineCurve, Vector2, Vector3} from "three";
import {get_node_name} from "./nodesUtils";
import {MeshType} from "./getMaterialAndGeometry";
import { IConfig, IFloorData } from "../../types";

export const getMeshParams = (path: SVGResultPaths, paths: SVGResultPaths[], floors: IFloorData[], floor_index: number, config: IConfig, nodeCount: number, allNodesFloor: Record<string, number>, pathFinderGraph: Graph) => {
    const consolePrefix = 'MeshParams';
    let mesh_type:MeshType = null;
    var layer_color: Color | string = path.color.clone();
    var extrude = 0;
    var z_index = 0;
    var mesh_visible = true;
    var mesh_draw = true;
    var mesh_transparent = false;
    var line_thickness = config.WALL_THICKNESS;
    var interactiveMesh = true;
    var layer_name = path.userData?.node.id;
    if (layer_name != undefined) {
        if (layer_name.startsWith('boundary')) {
            mesh_type = 'boundary';
            layer_color = config.BOUNDARY_COLOR;
            line_thickness = config.BOUNDARY_THICKNESS;
            if (config.STYLE == '3D') {
                extrude = 9;
            }
        } else if (layer_name.startsWith('wall')) {
            mesh_type = 'wall';
            layer_color = config.WALL_COLOR;
            if (config.STYLE == '3D') {
                extrude = 8.5;
            }
        } else if (layer_name.startsWith('outer-wall')) {
            mesh_type = 'outer-wall';
            layer_color = config.WALL_COLOR;
            if (config.STYLE == '3D') {
                mesh_draw = false;
            }
        } else if (layer_name.startsWith('building-base')) {
            mesh_type = 'building-base';
            layer_color = config.BUILDING_BASE_COLOR;
            if (config.STYLE == '3D') {
                extrude = 12;
                z_index = -12;
            }
        } else if (layer_name.startsWith('base')) {
            mesh_type = 'base';
            layer_color = config.BASE_COLOR;
        } else if (layer_name.startsWith('store')) {
            mesh_type = 'store';
            layer_color = config.STORE_DEFAULT_COLOR;
            if (config.STYLE == '3D') {
                extrude = 8;
            }
            if (layer_name.startsWith('store-underlay')) {
                interactiveMesh = false;
            }
        } else if (layer_name.startsWith('big-store')) {
            mesh_type = 'big-store';
            layer_color = config.BIG_STORE_DEFAULT_COLOR;
            if (config.STYLE == '3D') {
                extrude = 16;
            }
        } else if (layer_name.startsWith('route-path')) {
            mesh_type = 'route-path';
            mesh_draw = false;
            path.subPaths.forEach(subPath => {
                if (subPath.curves.length == 0) {
                    console.warn(consolePrefix + 'Route-path standalone anchor point exists, layer_name: "%s"', layer_name);
                }

                subPath.curves.forEach(curve => {
                    //@ts-ignore
                    const v1:Vector2 = curve.v1;
                    //@ts-ignore
                    const v2:Vector2 = curve.v2;

                    const [node1_name, exists1] = get_node_name(v1, floor_index, floors, nodeCount);
                    if (!exists1) {
                        floors[floor_index].route_points?.push({
                            name: node1_name,
                            node: new Vector3(v1.x, v1.y, 1)
                        });
                        allNodesFloor[node1_name] = floor_index;
                    }
                    const [node2_name, exists2] = get_node_name(v2, floor_index, floors, nodeCount);
                    if (!exists2) {
                        floors[floor_index].route_points?.push({
                            name: node2_name,
                            node: new Vector3(v2.x, v2.y, 1)
                        });
                        allNodesFloor[node2_name] = floor_index;
                    }
                    pathFinderGraph.addNode(node1_name, { ...v1 });
                    pathFinderGraph.addNode(node2_name, { ...v2 });

                    // pathFinderGraph.addLink(node1_name, node2_name);
                    pathFinderGraph.addLink(node1_name, node2_name, { weight: v1.distanceTo(v2) });
                    pathFinderGraph.addLink(node2_name, node1_name, { weight: v1.distanceTo(v2) });
                });
            });
        } else if (layer_name.startsWith('escalator-')) {
            mesh_type = 'escalator';
            mesh_visible = false;
        } else if (layer_name.startsWith('kiosk-')) {
            mesh_type = 'kiosk';
            mesh_transparent = true;
        } else if (layer_name.startsWith('amenity-')) {
            mesh_type = 'amenity';
            mesh_transparent = true;
            z_index = 1;
        } else if (layer_name.startsWith('overlay')) {
            mesh_type = 'overlay';
        } else if (layer_name.startsWith('special-shape')) {
            mesh_type = 'special-shape';
        } else {
            extrude = 1;
        }
    } else {
        console.warn(consolePrefix + 'Layer name is undefined, path', path)
    }


    /*console.debug({
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
    })*/
    return {
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
    }
}