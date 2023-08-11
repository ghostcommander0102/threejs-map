import type {Vector2} from "three";
import {IFloorData} from "./types";

export function next_node_name(node_count: number) {
    return 'node-' + node_count;
}

export function get_node_name(vertex: Vector2, floor_index: number, floors: IFloorData[], node_count: number) {
    let exists = false;
    let node_name = null;
    for (let i = 0; i < floors[floor_index].route_points.length; i++) {
        if (vertex.x == floors[floor_index].route_points[i].node.x && vertex.y == floors[floor_index].route_points[i].node.y) {
            exists = true;
            node_name = floors[floor_index].route_points[i].name;
            break;
        }
    }
    if (!exists) {
        node_name = next_node_name(node_count);
        // draw_points([{ x: vertex.x, y: vertex.y }]);
    }
    return [node_name, exists];
}