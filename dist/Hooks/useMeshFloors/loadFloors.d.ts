/// <reference types="ngraph.graph" />
/// <reference types="ngraph.events" />
import { SVGResult } from "three-stdlib";
import { IConfig, IFloorData, IMeshValues, TRoles } from "src/types";
export declare function loadFloors(floors: IFloorData[], config: IConfig, results: SVGResult[], role?: TRoles): {
    GeometriesAndMaterials: IMeshValues[][];
    graph: import("ngraph.graph").Graph<any, any> & import("ngraph.events").EventedType;
    escalator_nodes: string[];
};
