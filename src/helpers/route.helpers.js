import {
    CurvePath,
    Vector3,
    LineCurve3,
    TubeGeometry,
    BufferGeometry,
    MeshBasicMaterial,
    DoubleSide,
    Mesh,
    CanvasTexture,
    Color,
} from "three";
import { getRenderOrder } from "Hooks/useMeshFloors/getMaterialAndGeometry";
import { get_camera_focus_object } from "./camera.helpers";
import { defaultVars, mapit2DefaultVars } from "Hooks/useMeshFloors/defaults";
import { allNodesFloor, ngraphPath } from "Hooks/useMeshFloors/globals";

const consolePrefix = 'ROUTE: ';
let route_exists = null;
let activeMapObjectName = null;

function makeObjectActive(object_id = null, accentColor, scene) {
    clearActiveEffect(scene);
    if (object_id != null) activeMapObjectName = object_id;
    let obj = scene.getObjectByProperty('object_id', activeMapObjectName);
    // obj.material.color = config.ACCENT_COLOR;
    obj.material.color = new Color(`#${accentColor}`);
    obj.material.active = true;
    return obj;
}

function clearActiveEffect(scene) {
    if (activeMapObjectName) {
        let obj = scene.getObjectByProperty('object_id', activeMapObjectName);
        obj.material.color = { ...obj.material.colorDefault };
        obj.material.active = false;
        activeMapObjectName = null;
    }
}

function delete_route_path(floors, escalatorElems = null) {
    for (let floor_index = 0; floor_index < floors.length; floor_index++) {
        const floor = floors[floor_index];
        floor.route_active = false;

        if (floor.route_tube != null) {
            floor.route_tube.geometry.dispose();
            floor.route_tube.material.dispose();
            floor.objsGroup.remove(floor.route_tube);
        }

        floor.route_tube = null;
        floor.route_texture = null;
        floor.escalatorMeshes = [];
    }
    if (escalatorElems) {
        escalatorElems.html('').hide();
    }
}

export function create_route(from_mesh_object_id, to_mesh_object_id, camera, scene, floors, accentColor, pathFinderGraph, routeCallback = null) {
    if (from_mesh_object_id != to_mesh_object_id) {
        route_exists = create_route_paths(from_mesh_object_id, to_mesh_object_id, scene, 0, 0, allNodesFloor, [], floors, pathFinderGraph, routeCallback);
        if (!route_exists) console.warn(consolePrefix + 'No route found in between "%s" and "%s"', from_mesh_object_id, to_mesh_object_id);
        makeObjectActive(to_mesh_object_id, accentColor, scene);
        if (!route_exists) {
            let obj = scene.getObjectByProperty('object_id', to_mesh_object_id);
            const {position, target} =get_camera_focus_object([obj], camera.fov, camera.aspectRatio, '2D');
            camera.position.copy(position);
        }
    }
}

function create_route_paths(from_mesh_object_id, to_mesh_object_id, scene, from_route_floor_index, to_route_floor_index, allNodesFloor, escalator_nodes, floors, pathFinderGraph, routeCallback = null) {
    delete_route_path(floors);
    let from_obj = scene.getObjectByProperty('object_id', from_mesh_object_id);
    let to_obj = scene.getObjectByProperty('object_id', to_mesh_object_id);
    let from_node_name = from_obj.route_node_id;
    let to_node_name = to_obj.route_node_id;
    from_node_name = 'node-140';
    to_node_name = 'node-215';

    if (from_node_name == null) console.error(consolePrefix + 'Route Anchor point missing for "%s"', from_mesh_object_id);
    if (to_node_name == null) console.error(consolePrefix + 'Route Anchor point missing for "%s"', to_mesh_object_id);

    if (from_node_name == null || to_node_name == null) return false;

    from_route_floor_index = from_obj.floor_index;
    to_route_floor_index = to_obj.floor_index;

    const aStarPathFinder = ngraphPath.aStar(pathFinderGraph, {
        distance: function (fromNode, toNode, link) {
            if (link.data) return link.data.weight;
            return false;
        },
        debug: true,
    });
    const routeNodes = get_route_nodes(from_node_name, to_node_name, aStarPathFinder);
    const routeNodesEsclators = [];
    if (routeNodes) {
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

        for (let index; index < routeNodesEsclators.length; index++) {
            const routeNode = routeNodesEsclators[index];
            if (
                allNodesFloor[routeNodesEsclators[0].id] !== allNodesFloor[routeNodesEsclators[routeNodesEsclators.length - 1].id] // proceed only if the start node and end node is not on the same floor
                && escalator_nodes.includes(routeNode.id) // proceed only if the current node is a escalator
            ) {
                const escalator_id = Object.keys(floors[allNodesFloor[routeNode.id]].escalatorsNodes).find(key => floors[allNodesFloor[routeNode.id]].escalatorsNodes[key] === routeNode.id);
                const escalator_mesh = scene.getObjectByProperty('escalator_id', allNodesFloor[routeNode.id] + '-' + escalator_id);
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

                if (goToFloor) {
                    escalator_mesh.goToFloor = goToFloor;
                    floors[allNodesFloor[routeNode.id]].escalatorMeshes.push(escalator_mesh);
                }
            }

        }
        for (let floor_index = 0; floor_index < floor_routes.length; floor_index++) {
            const floor_route = floor_routes[floor_index];
            if (floor_route.length > 1) {
                create_route_path(floor_route, floor_index, floors, '2D', routeCallback);

                floors[floor_index].route_active = true;
                floors[floor_index].routeMeshes = [floors[floor_index].route_tube];
                if (floor_index === from_route_floor_index) {
                    floors[floor_index].routeMeshes.push(from_obj);
                }
                if (floor_index === to_route_floor_index) {
                    floors[floor_index].routeMeshes.push(to_obj);
                }
            }
        }

        setTimeout(function () {
            //TODO openFloorMap functionality
            // openFloorMap(from_route_floor_index);
        });
    }

    return true;
}

function create_route_path(
    routeNodes,
    floor_index,
    floors,
    style = '2D',// config.STYLE
    routeCallback = null
) {
    let distance = 0;
    let route_path = new CurvePath();
    for (let i = 1; i < routeNodes.length; i++) {
        let from_node = new Vector3(routeNodes[i - 1].data.x, routeNodes[i - 1].data.y, 0);
        let to_node = new Vector3(routeNodes[i].data.x, routeNodes[i].data.y, 0);
        route_path.add(new LineCurve3(from_node, to_node));
        distance += from_node.distanceTo(to_node);
    };
    var geometry = new TubeGeometry(route_path, 400, 6, 8);
    geometry = new BufferGeometry().copy(geometry);
    var material = new MeshBasicMaterial({
        map: get_route_texture(distance, floor_index, floors),
        transparent: true,
        side: DoubleSide,
        depthTest: false,
        depthWrite: false,
    });

    let route_tube = new Mesh(geometry, material);
    if (style == '2D') {
        route_tube.position.z = -10;
    }
    route_tube.position.z = 0;
    route_tube.renderOrder = getRenderOrder('route-tube');
    route_tube.mesh_type = 'route-tube';

    route_tube.geometry.setDrawRange(0, 0);
    draw_route_tube(route_tube, geometry.attributes.position.count, floors);

    floors[floor_index].route_tube = route_tube;
    floors[floor_index].objsGroup.add(route_tube);
    if (routeCallback) {
        routeCallback(route_tube);
    }
    return true;
}

function get_route_nodes(from_node_name, to_node_name, aStarPathFinder) {
    let routeNodes = aStarPathFinder.find(to_node_name, from_node_name);
    if (routeNodes.length == 0) return false;
    return routeNodes;
}

//TODO
function get_nodes_distance(from_node_name, to_node_name, aStarPathFinder, pathFinderGraph) {
    let distance = 0;

    let routeNodes = aStarPathFinder.find(to_node_name, from_node_name);
    if (routeNodes.length == 0) return false;

    for (let i = 1; i < routeNodes.length; i++) {
        let link = pathFinderGraph.getLink(routeNodes[i - 1].id, routeNodes[i].id);
        distance += link.data.weight || 0;
    };
    return distance;
}

function draw_route_tube(route_tube, total_faces, floors) {
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

function get_route_texture(distance, floor_index, floors) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
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

    floors[floor_index].route_texture = route_texture;

    return route_texture;
}

//TODO
function animate_route_path(floors) {
    /*floors.forEach(floor => {
        if (floor.route_texture != null) {
            createjs.Ticker.framerate = 60;
            createjs.Tween.get(floor.route_texture.offset, { loop: true })
                .to({ x: -1 }, 2000, createjs.Ease.cubicInOut)
        }
    });*/
}

export function assign_route_nodes_to_stores(
    floor_index,
     floors,
     allIndexedMapObjects,
     allIndexedRetailers,
     allNodesFloor,
     escalator_nodes,
     find_store_node_raycaster,
     role, //config.ROLE
     ) {
    floors[floor_index].route_points.forEach(point => {
        let origin_point = new Vector3(point.node.x, -10, point.node.y);
        let target_direction = new Vector3(0, 1, 0);
        find_store_node_raycaster.set(origin_point, target_direction);
        var storeIntersects = find_store_node_raycaster.intersectObjects(floors[floor_index].interactiveObjs);
        if (storeIntersects.length) {
            console.debug({storeIntersects});
            storeIntersects[0].object.route_node_id = point.name;

            if (role != 'PORTAL') {
                var retailer_id = allIndexedMapObjects[storeIntersects[0].object.object_id].retailer_id;
                if (retailer_id != null && allIndexedRetailers[retailer_id]) {
                    var retailer_index = allIndexedRetailers[retailer_id].index;
                    // ngCtrlElem.scope().allRetailers[retailer_index].has_route = true;
                }
            }
        }

        var escalatorIntersects = find_store_node_raycaster.intersectObjects(floors[floor_index].escalatorsObjs);
        if (escalatorIntersects.length) {
            let escalator_obj_id = escalatorIntersects[0].object.object_id;
            floors[floor_index].escalatorsNodes[escalator_obj_id] = point.name;
            allNodesFloor[point.name] = floor_index;
            escalator_nodes.push(point.name);
        }
    });
}


