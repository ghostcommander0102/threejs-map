import { Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, BufferGeometry, Box3 } from "three";
import type { Scene } from "three";
import { IExtMesh } from "../types";
import { IRetailer, MapObj } from "../mapitApiTypes";
export declare function drawTextLogoStoreOnMap(allNonIndexedMapObjects: Record<any, any>[], scene: Scene, textLogoNamePrefix: string, allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<string, IRetailer>, config: Record<any, any>, myFont: any, floors: Record<any, any>[]): void;
export declare function getMeshGroupBoundingBox(mesh: Mesh | Array<Mesh>): Box3;
export declare function layer_text_logo_position_by_id(object_id: string, newMeshPos: Vector3, mesh_size: Vector3, newMesh: Mesh, allIndexedMapObjects: Record<any, any>): void;
export declare const getImage: (map_obj: Record<string, any>, retailer?: IRetailer) => HTMLImageElement | null;
export declare const processImage: (img: HTMLImageElement, map_obj: Record<string, any>, afterOnload: (geometry: PlaneGeometry, material: MeshBasicMaterial) => void) => void;
export declare function get_store_name_logo_geo(geometry: BufferGeometry, object_id: string, floor_index: number, textLogoNamePrefix: string, allIndexedMapObjects: Record<any, any>, allIndexedRetailers: Record<any, any>, config: Record<any, any>, myFont: any, floors: Record<any, any>, handleAsync: (meshLogo: any) => void): {
    textMesh: IExtMesh;
} | null | false;
