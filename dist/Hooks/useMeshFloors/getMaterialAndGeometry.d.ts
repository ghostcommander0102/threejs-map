import { Color } from "three";
import { IConfig, IMeshValues, TMapMode } from "../../types";
import { IRetailer, MapObj } from "../../mapitApiTypes";
declare const renderOrders: {
    'route-path': number;
    escalator: number;
    underlay: number;
    overlay: number;
    'building-base': number;
    base: number;
    store: number;
    'big-store': number;
    kiosk: number;
    wall: number;
    'outer-wall': number;
    boundary: number;
    amenity: number;
    'layer-image': number;
    'layer-text': number;
    'route-tube': number;
    'special-shape': number;
};
export type MeshType = keyof typeof renderOrders | null;
export declare function getRenderOrder(mesh_type: MeshType): number;
export declare const getMaterialAndGeometry: (config: IConfig, mesh_type: MeshType, layer_name: string, layer_color: Color | string, mesh_transparent: boolean, mesh_visible: boolean, z_index: number, extrude: number, line_thickness: number, floors: any, floor_index: number, allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<string, IRetailer>, path: any, mode?: TMapMode) => IMeshValues;
export {};