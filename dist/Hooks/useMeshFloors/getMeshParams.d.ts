import { SVGResultPaths } from "three-stdlib";
import { Graph } from "ngraph.graph";
import { Color } from "three";
import { IConfig, IFloorData } from "../../types";
export declare const getMeshParams: (path: SVGResultPaths, paths: SVGResultPaths[], floors: IFloorData[], floor_index: number, config: IConfig, nodeCount: number, allNodesFloor: Record<string, number>, pathFinderGraph: Graph) => {
    mesh_type: "base" | "route-path" | "escalator" | "overlay" | "building-base" | "store" | "big-store" | "kiosk" | "wall" | "outer-wall" | "boundary" | "amenity" | "special-shape" | null;
    layer_color: Color;
    extrude: number;
    z_index: number;
    mesh_visible: boolean;
    mesh_draw: boolean;
    mesh_transparent: boolean;
    line_thickness: number;
    interactiveMesh: boolean;
    path: SVGResultPaths;
    layer_name: any;
};
