import type { Vector2 } from "three";
import { IFloorData } from "../../types";
export declare function next_node_name(node_count: number): string;
export declare function get_node_name(vertex: Vector2, floor_index: number, floors: IFloorData[], node_count: number): [string, boolean];
