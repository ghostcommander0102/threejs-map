import { Mesh, BufferGeometry, Box3 } from "three";
import type { Scene } from "three";
import { IExtMesh } from "../types";
import { IRetailer, MapObj } from "../mapitApiTypes";
export declare function drawTextLogoStoreOnMap(allNonIndexedMapObjects: Record<any, any>[], scene: Scene, textLogoNamePrefix: string, allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<string, IRetailer>, config: Record<any, any>, myFont: any, floors: Record<any, any>[]): void;
export declare function getMeshGroupBoundingBox(mesh: Mesh | Array<Mesh>): Box3;
export declare function get_store_name_logo_geo(geometry: BufferGeometry, object_id: string, floor_index: number, textLogoNamePrefix: string, allIndexedMapObjects: Record<any, any>, allIndexedRetailers: Record<any, any>, config: Record<any, any>, myFont: any, floors: Record<any, any>, handleAsync: (meshLogo: any) => void): {
    textMesh: IExtMesh;
} | null | false;
