import { Mesh, Raycaster, Scene } from "three";
import { IRetailer, MapObj } from "../mapitApiTypes";
import { IFloorData } from "../types";
import { Graph } from "ngraph.graph";
export declare function delete_route_path(floors: IFloorData[]): void;
export declare function create_route(from_mesh_object_id: string, to_mesh_object_id: string, scene: Scene, floors: IFloorData[], escalator_nodes: string[], pathFinderGraph: Graph, style: string): Mesh[];
export declare function assign_route_nodes_to_stores(floor_index: number, floors: IFloorData[], allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<string, IRetailer>, allNodesFloor: Record<string, number>, escalator_nodes: string[], find_store_node_raycaster: Raycaster, role: string): Map<any, any>;
export declare function linkFloorEscalators(floors: IFloorData[], pathFinderGraph: Graph): void;
export declare function make_amenity_route(kiosk_obj_name: string, amenity_type: string, scene: Scene, allIndexedMapObjects: Record<string, MapObj>, pathFinderGraph: Graph, floors: IFloorData[], escalator_nodes: string[], style: string): Mesh[];
