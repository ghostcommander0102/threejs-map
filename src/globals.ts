import createGraph from "ngraph.graph";
import {IRetailer, MapObj} from "./mapitApiTypes";
import type {Mesh} from "three";
import path from "ngraph.path";

export const meshByObjectId = new Map<string,Mesh>();
export const allMapObjects:string[] = [];
export const allIndexedMapObjects = {} as Record<string, MapObj>;
export const allIndexedRetailers = {} as Record<string, IRetailer>;
export const allNodesFloor = {} as Record<string, number>;

//<{ x:number, y:number }, { weight: number }>
export const pathFinderGraph = createGraph();
export const ngraphPath = path;
