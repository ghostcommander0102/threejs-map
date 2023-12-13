import type {Vector2} from "three";
import {IFloorData} from "../../types";

export function next_node_name(node_count: number) {
    return 'node-' + node_count;
}

export function get_node_name(vertex: Vector2, floor_index: number, floors: IFloorData[], node_count: number): [string , boolean] {
    let exists = false;
    let node_name:string = '-name-not-found-';
    const currentFloor = floors[floor_index];
    if (currentFloor.route_points !== undefined) {
        for (let i = 0; i < currentFloor.route_points.length; i++) {
            if (vertex.x == currentFloor.route_points[i].node.x && vertex.y == currentFloor.route_points[i].node.y) {
                exists = true;
                node_name = currentFloor.route_points[i].name;
                break;
            }
        }
        if (!exists) {
            node_name = next_node_name(node_count);
            // draw_points([{ x: vertex.x, y: vertex.y }]);
        }
    }
    return [node_name, exists];
}