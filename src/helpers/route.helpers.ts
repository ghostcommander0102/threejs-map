import {
    BufferGeometry,
    CanvasTexture,
    Color,
    CurvePath,
    DoubleSide,
    LineCurve3,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Raycaster,
    Scene,
    TubeGeometry,
    Vector3,
} from "three";
import {getRenderOrder} from "Hooks/useMeshFloors/getMaterialAndGeometry";
import {allNodesFloor} from "../globals";
import * as ngraphPath from "ngraph.path";
import {PathFinder} from "ngraph.path";
import {IRetailer, MapObj} from "../mapitApiTypes";
import {IExtMesh, IFloorData} from "../types";
import {Graph, Node} from "ngraph.graph";

const consolePrefix = 'ROUTE: ';
let route_exists = null;
let activeMapObjectName: string | null = null;

function makeObjectActive(object_id: string | null = null, accentColor: string | Color, scene: Scene) {
    clearActiveEffect(scene);
    if (object_id != null) activeMapObjectName = object_id;
    let obj = scene.getObjectByProperty('object_id', activeMapObjectName as string) as IExtMesh;
    // obj.material.color = config.ACCENT_COLOR;
    //@ts-ignore
    obj.material.color = new Color(`#${accentColor}`);
    //@ts-ignore
    obj.material.active = true;
    return obj;
}

function clearActiveEffect(scene: Scene) {
    if (activeMapObjectName) {
        let obj = scene.getObjectByProperty('object_id', activeMapObjectName) as IExtMesh;
        //@ts-ignore
        obj.material.color = { ...obj.material.colorDefault };
        //@ts-ignore
        obj.material.active = false;
        activeMapObjectName = null;
    }
}

export function delete_route_path(floors: IFloorData[]) {
    for (let floor_index = 0; floor_index < floors.length; floor_index++) {
        const floor = floors[floor_index];
        floor.route_active = false;

        if (floor.route_tube != null) {
            floor.route_tube.geometry.dispose();
            //@ts-ignore
            floor.route_tube.material.dispose();
            floor.objsGroup?.remove(floor.route_tube);
        }

        floor.route_tube = undefined;
        floor.route_texture = null;
        floor.escalatorMeshes = [];
    }
}

export function create_route(from_mesh_object_id: string, to_mesh_object_id: string, scene: Scene, floors: IFloorData[], escalator_nodes: string[], pathFinderGraph: Graph, style: string): Mesh[] {
    if (from_mesh_object_id === to_mesh_object_id) {
        return [];
    }
    const routePaths = create_route_paths(from_mesh_object_id, to_mesh_object_id, scene, allNodesFloor, escalator_nodes, floors, pathFinderGraph, style);
    if (!routePaths.length) console.warn(consolePrefix + 'No route found in between "%s" and "%s"', from_mesh_object_id, to_mesh_object_id);

    return routePaths;
}

function create_route_paths(from_mesh_object_id: string, to_mesh_object_id: string, scene: Scene, allNodesFloor: Record<string, number>, escalator_nodes: any[] , floors: IFloorData[], pathFinderGraph: Graph, style: string, routeCallback = null) {
    // TODO: remove scene dependency and scene.getObjectByProperty
    const routePaths = [] as any[];
    delete_route_path(floors);
    let from_obj = scene.getObjectByProperty('object_id', from_mesh_object_id) as IExtMesh;
    let to_obj = scene.getObjectByProperty('object_id', to_mesh_object_id) as IExtMesh;
    let from_node_name = from_obj.route_node_id;
    let to_node_name = to_obj.route_node_id;

    // console.log({
    //     from_mesh_object_id,
    //     to_mesh_object_id,
    //     from_obj,
    //     to_obj,
    //     from_node_name,
    //     to_node_name,
    // })

    // from_node_name = 'node-147';
    // to_node_name = 'node-221';

    if (!from_node_name) console.error(consolePrefix + 'Route Anchor point missing for "%s"', from_mesh_object_id);
    if (!to_node_name) console.error(consolePrefix + 'Route Anchor point missing for "%s"', to_mesh_object_id);

    if (!from_node_name || !to_node_name) return routePaths;

    const from_route_floor_index = from_obj.floor_index;
    const to_route_floor_index = to_obj.floor_index;

    const aStarPathFinder = ngraphPath.aStar(pathFinderGraph, {
        distance: function (fromNode, toNode, link) {
            if (link.data) return link.data.weight;
            return false;
        },
        //@ts-ignore
        debug: true,
    });
    const routeNodes = get_route_nodes(from_node_name, to_node_name, aStarPathFinder);
    const routeNodesEsclators = [];
    if (!routeNodes) {
        return [];
    }
    const floor_routes = [];

    for (let index = 0; index < routeNodes.length; index++) {
        const routeNode = routeNodes[index];
        if (floor_routes[allNodesFloor[routeNode.id]]) {
            floor_routes[allNodesFloor[routeNode.id]].push(routeNode);
        } else {
            floor_routes[allNodesFloor[routeNode.id]] = [routeNode];
        }

        if (escalator_nodes.includes(routeNode.id) && escalator_nodes.includes(routeNodes[index - 1].id) && escalator_nodes.includes(routeNodes[index + 1].id)) {
            // don't consider these middle escalators nodes
        } else {
            routeNodesEsclators.push(routeNode);
        }
    }
    for (let index = 0; index < routeNodesEsclators.length; index++) {
        const routeNode = routeNodesEsclators[index];
        if (
            allNodesFloor[routeNodesEsclators[0].id] !== allNodesFloor[routeNodesEsclators[routeNodesEsclators.length - 1].id] // proceed only if the start node and end node is not on the same floor
            && escalator_nodes.includes(routeNode.id) // proceed only if the current node is a escalator
        ) {
            const escalator_id = Object.keys(floors[allNodesFloor[routeNode.id]].escalatorsNodes as object).find(key => floors[allNodesFloor[routeNode.id]]?.escalatorsNodes?.[key] === routeNode.id);
            const escalator_mesh: IExtMesh = scene.getObjectByProperty('escalator_id', allNodesFloor[routeNode.id] + '-' + escalator_id) as IExtMesh;
            let goToFloor = null;

            if (allNodesFloor[routeNode.id] !== allNodesFloor[routeNodesEsclators[index + 1].id] && escalator_nodes.includes(routeNodesEsclators[index + 1].id)) {
                goToFloor = {
                    index: allNodesFloor[routeNodesEsclators[index + 1].id],
                    direction: 'Next',
                };
            }

            if (allNodesFloor[routeNode.id] !== allNodesFloor[routeNodesEsclators[index - 1].id] && escalator_nodes.includes(routeNodesEsclators[index - 1].id)) {
                goToFloor = {
                    index: allNodesFloor[routeNodesEsclators[index - 1].id],
                    direction: 'Previous',
                };
            }

            if (goToFloor && escalator_mesh) {
                escalator_mesh.goToFloor = goToFloor;
                //@ts-ignore
                floors[allNodesFloor[routeNode.id]]?.escalatorMeshes?.push(escalator_mesh);
            }
        }

    }
    for (let floor_index = 0; floor_index < floor_routes.length; floor_index++) {
        const floor_route = floor_routes[floor_index];
        if (floor_route && floor_route.length > 1) {
            const routePath = create_route_path(floor_route, floor_index, floors, style);
            routePaths[floor_index] = routePath;

            floors[floor_index].route_active = true;
            floors[floor_index].routeMeshes = [ routePath ];
            if (floor_index === from_route_floor_index) {
                //@ts-ignore
                floors[floor_index]?.routeMeshes?.push(from_obj);
            }
            if (floor_index === to_route_floor_index) {
                //@ts-ignore
                floors[floor_index]?.routeMeshes?.push(to_obj);
            }
        }
    }

    // setTimeout(function () {
    //     //TODO openFloorMap functionality
    //     // openFloorMap(from_route_floor_index);
    // });

    return routePaths;
}

function create_route_path(
    routeNodes: Node<any>[],
    floor_index: number,
    floors: IFloorData[],
    style = '2D',// config.STYLE
) {
    let distance = 0;
    let route_path = new CurvePath<Vector3>();
    for (let i = 1; i < routeNodes.length; i++) {
        let from_node = new Vector3(routeNodes[i - 1].data.x, routeNodes[i - 1].data.y, 0);
        let to_node = new Vector3(routeNodes[i].data.x, routeNodes[i].data.y, 0);
        route_path.add(new LineCurve3(from_node, to_node));
        distance += from_node.distanceTo(to_node);
    };
    var geometry: TubeGeometry = new TubeGeometry(route_path, 400, 6, 8);
    //@ts-ignore
    geometry = new BufferGeometry().copy(geometry);
    var material = new MeshBasicMaterial({
        map: get_route_texture(distance, floor_index, floors),
        transparent: true,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false,
    });

    let route_tube = new Mesh(geometry, material) as IExtMesh;
    if (style == '2D') {
        route_tube.position.z = -10;
    }
    route_tube.position.z = 0;
    route_tube.renderOrder = getRenderOrder('route-tube');
    route_tube.mesh_type = 'route-tube';
    //@ts-ignore
    route_tube.geometry.setDrawRange(0, route_tube.geometry.index.count);
    // draw_route_tube(route_tube, geometry.attributes.position.count, floors);

    floors[floor_index].route_tube = route_tube;
    floors[floor_index].objsGroup?.add(route_tube);

    return route_tube;
}

function get_route_nodes(from_node_name: string, to_node_name: string, aStarPathFinder: PathFinder<any>) {
    let routeNodes = aStarPathFinder.find(to_node_name, from_node_name);
    if (routeNodes.length == 0) return false;
    return routeNodes;
}

//TODO
function get_nodes_distance(from_node_name: string, to_node_name: string, aStarPathFinder: PathFinder<any>, pathFinderGraph: Graph) {
    let distance = 0;

    let routeNodes = aStarPathFinder.find(to_node_name, from_node_name);
    if (routeNodes.length == 0) return false;

    for (let i = 1; i < routeNodes.length; i++) {
        let link = pathFinderGraph.getLink(routeNodes[i - 1].id, routeNodes[i].id);
        distance += link?.data.weight || 0;
    };
    return distance;
}

function draw_route_tube(route_tube: IExtMesh, total_faces: number) {
    //@ts-ignore
    route_tube.geometry.setDrawRange(0, total_faces);
    /*createjs.Ticker.framerate = 60;
    createjs.Tween.get({ x: 0 },
        {
            onChange: function (event) {
                route_tube.geometry.setDrawRange(0, event.target.target.x);
            },
            onComplete: function () {
                animate_route_path(floors);
            }
        })
        .to({ x: total_faces }, 1000, createjs.Ease.cubicInOut);
    */
}

function get_route_texture(distance: number, floor_index: number, floors: IFloorData[]) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.canvas.width = distance;
        ctx.canvas.height = 80;

        ctx.fillStyle = "#4ea5ff";
        ctx.fillRect(0, 0, distance, 80);

        let grd_width = 0.1 * distance;
        const min_grd_width = 60;
        const max_grd_width = 120;
        if (grd_width < min_grd_width) grd_width = min_grd_width;
        if (grd_width > max_grd_width) grd_width = max_grd_width;

        let grd = ctx.createLinearGradient(0, 0, grd_width, 0);
        grd.addColorStop(0, "#4ea5ff");
        grd.addColorStop(0.4, "white");
        grd.addColorStop(0.6, "white");
        grd.addColorStop(1, "#4ea5ff");

        ctx.fillStyle = grd;
        ctx.fillRect(10, 0, grd_width, 80);

    let route_texture = new CanvasTexture(ctx.canvas);
    route_texture.offset.x = 1;
    route_texture.colorSpace = 'srgb';

        floors[floor_index].route_texture = route_texture;

        return route_texture;
    } else {
        return undefined;
    }
}

//TODO
function animate_route_path(floors: IFloorData[]) {
    /*floors.forEach(floor => {
        if (floor.route_texture != null) {
            createjs.Ticker.framerate = 60;
            createjs.Tween.get(floor.route_texture.offset, { loop: true })
                .to({ x: -1 }, 2000, createjs.Ease.cubicInOut)
        }
    });*/
}

export function assign_route_nodes_to_stores(
    floor_index: number,
     floors: IFloorData[],
     allIndexedMapObjects: Record<string, MapObj>,
     allIndexedRetailers: Record<string, IRetailer>,
     allNodesFloor: Record<string, number>,
     escalator_nodes: string[],
     find_store_node_raycaster: Raycaster,
     role: string, //config.ROLE
     ) {
    const result = new Map();
    const currentFloor = floors[floor_index];
    if (currentFloor && currentFloor.route_points) {
        currentFloor.route_points.forEach(point => {
            let origin_point = new Vector3(point.node.x, point.node.y, -10);
            let target_direction = new Vector3(0, 0, 1);
            find_store_node_raycaster.set(origin_point, target_direction);
            //@ts-ignore
            var storeIntersects = find_store_node_raycaster.intersectObjects(floors[floor_index].interactiveObjs);
            if (storeIntersects.length) {
                //@ts-ignore
                storeIntersects[0].object.route_node_id = point.name;
                //@ts-ignore
                result.set(storeIntersects[0].object.object_id, point.name);
                if (role != 'PORTAL') {
                    //@ts-ignore
                    var retailer_id = allIndexedMapObjects[storeIntersects[0].object.object_id].retailer_id;
                    if (retailer_id != null && allIndexedRetailers[retailer_id]) {
                        var retailer_index = allIndexedRetailers[retailer_id].index;
                        // ngCtrlElem.scope().allRetailers[retailer_index].has_route = true;
                    }
                }
            }

            var escalatorIntersects = find_store_node_raycaster.intersectObjects(floors[floor_index].escalatorsObjs as Object3D[]);
            if (escalatorIntersects.length) {
                const obj: IExtMesh = escalatorIntersects[0].object as IExtMesh;
                let escalator_obj_id = obj.object_id;
                const escalatorNodes = floors[floor_index].escalatorsNodes;
                if (escalatorNodes) {
                    escalatorNodes[escalator_obj_id as string] = point.name;
                    allNodesFloor[point.name] = floor_index;
                    escalator_nodes.push(point.name);
                }
            }
        });
    }
    return result;
}

export function linkFloorEscalators(floors: IFloorData[], pathFinderGraph: Graph) {
    // console.log('linkFloorEscalators', floors)
    if (floors.length > 1) {
        for(let i=0; i < (floors.length-1); i++) {
            // console.log('floors[i]',i, floors[i])
            const floor_escalators = floors[i].escalatorsNodes;
            // console.log('floor_escalators', floor_escalators);
            Object.keys(floor_escalators as object).forEach(escalator => {
                if (floors[i].escalatorsNodes?.[escalator] != null && floors[i+1].escalatorsNodes?.[escalator] != null) {
                    // console.log('escalator, add link from floor %d to %d (and back)', i, i+1, escalator)
                    const nodeIdFrom = floors[i].escalatorsNodes?.[escalator];
                    const nodeIdTo = floors[i+1].escalatorsNodes?.[escalator];
                    if (nodeIdFrom && nodeIdTo) {
                        pathFinderGraph.addLink(nodeIdFrom, nodeIdTo, { weight: 1 });
                        pathFinderGraph.addLink(nodeIdTo, nodeIdFrom, { weight: 1 });
                    }
                } else {
                    // console.error(consolePrefix + 'Escalator route anchor point missing "%s"', escalator);
                }
            })
        }
    }
}

export function make_amenity_route(kiosk_obj_name: string, amenity_type: string, scene: Scene, allIndexedMapObjects: Record<string, MapObj>, pathFinderGraph: Graph, floors: IFloorData[], escalator_nodes: string[], style: string ): Mesh[] {
    let kiosk_obj: IExtMesh = scene.getObjectByProperty('object_id', kiosk_obj_name) as IExtMesh;
    if (!kiosk_obj) return [];
    let kiosk_node_name = kiosk_obj.route_node_id;

    var to_obj_name = null;

    var shortest_distance = 9999;
    // var map_objs = ngCtrlElem.scope().amenities[amenity_type];
    const map_objs: string[] = [];
    for(let key in allIndexedMapObjects) {
        const mapObject = allIndexedMapObjects[key];
        if (
            mapObject.layer_type === 'amenity'
            && mapObject.obj_type === 'special'
            && mapObject.value === amenity_type
        ) {
            map_objs.push(key);
        }
    }
    map_objs.forEach((amenity_obj_name: string, index: number) => {
        let amenity_obj: IExtMesh = scene.getObjectByProperty('object_id', amenity_obj_name) as IExtMesh;

    const aStarPathFinder = ngraphPath.aStar(pathFinderGraph, {
        distance: function (fromNode, toNode, link) {
            if (link.data) return link.data.weight;
            return false;
        },
        //@ts-ignore
        debug: true,
    });

    if (amenity_obj) {
        var amenity_node_name = amenity_obj.route_node_id;
        try {
            var route_distance = get_nodes_distance(kiosk_node_name ?? '', amenity_node_name ?? '', aStarPathFinder, pathFinderGraph);
            if (route_distance && route_distance < shortest_distance) {
                shortest_distance = route_distance;
                to_obj_name = amenity_obj_name;
            }
        } catch(e: any) {
            console.warn(`Amenity Path: ${e.message}`);
        }
    }
    });
    return create_route(kiosk_obj_name, to_obj_name?? '', scene, floors, escalator_nodes, pathFinderGraph, style);
}

