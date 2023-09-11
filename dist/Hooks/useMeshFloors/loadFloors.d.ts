/// <reference types="ngraph.graph" />
/// <reference types="ngraph.events" />
import { SVGResult } from "three-stdlib";
import { IConfig, IFloorData, IMeshValues, TMapMode } from "../../types";
export declare function loadFloors(floors: IFloorData[], config: IConfig, results: SVGResult[], mode?: TMapMode): {
    GeometriesAndMaterials: IMeshValues[][];
    graph: import("ngraph.graph").Graph<any, any> & import("ngraph.events").EventedType;
    escalator_nodes: string[];
};
