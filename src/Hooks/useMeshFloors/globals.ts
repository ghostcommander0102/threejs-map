import createGraph from "ngraph.graph";
import {MapObj} from "./mapitApiTypes";
import type {Mesh} from "three";

export const meshByObjectId = new Map<string,Mesh>();
export const allMapObjects:string[] = [];
export const allIndexedMapObjects = {} as Record<string, MapObj>[];
export const allNodesFloor = {};
console.error('createGraph')
export const pathFinderGraph = createGraph();