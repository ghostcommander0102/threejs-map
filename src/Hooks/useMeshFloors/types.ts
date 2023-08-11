import type {Color, Group, Material, Mesh, MeshLambertMaterial, ShapeGeometry} from "three";
import {CameraControlsState, Floor} from "./mapitApiTypes";

export interface IMeshValues {
    mesh: IExtMesh;
    geometry: ShapeGeometry;
    material: Material;
    object_id: string;
    mesh_type: string | null;
    floor_index: number;
    visible: boolean;
    renderOrder: number;
}

export interface IMeshParams {
    config: IConfig;
    meshParams: IMeshValues[];
    textParams: { textMesh: IExtMesh }[];
    storeLogos: { storeLogo: IExtMesh }[];
    drawText?: Function;
}

export interface IExtMeshLambertMaterial extends MeshLambertMaterial {
    colorDefault?: Color;
    active?: boolean;
}

export interface IExtMesh extends Mesh {
    object_id?: string | null;
    mesh_type?: string | null;
    floor_index?: number;
    route_node_id?: string | null;
    escalator_id?: string | null;
}

export interface IExtShapeGeometry extends ShapeGeometry {
    faces: any[];
}

export interface IFloorData {
    id: string,          // assuming `value.id` is a string
    svg_map: string,
    title: string,       // assuming `value.title` is a string
    objsGroup: Group,
    interactiveObjs: any[],
    escalatorsObjs: any[],
    escalatorsNodes: Record<string, any>,
    escalatorMeshes: any[],
    route_points: any[],
    route_tube: any,     // assuming `null` is a valid type
    route_texture: any,  // assuming `null` is a valid type
    routeMeshes: any[],
    route_active: boolean
}

export interface IConfig {
    BUILDING_BASE_COLOR: string;
    MAP_LOADED: boolean;
    BASE_COLOR: string;
    STATS: boolean;
    KIOSK: string;
    OVERLAY_OPACITY: number;
    DEFAULT_CAMERA_POSITION: null;
    BOUNDARY_THICKNESS: number;
    BIG_STORE_DEFAULT_COLOR: string;
    STORE_TEXT_COLOR: string;
    WALL_THICKNESS: number;
    CENTER_ID: string | null;
    ROLE: string;
    PAGE_LOADED: boolean;
    DEFAULT_SELECTED_STORE: string | null;
    CAMERA_CONTROLS_STATES: CameraControlsState | null;
    FLOORS: Floor[];
    STYLE: '2D' | '3D';
    BOUNDARY_COLOR: string;
    CAMERA: null;
    DEFAULT_CONTROLS_TARGET: null;
    DEBUG: string | number;
    CONTROLS: null;
    WALL_COLOR: string;
    OVERLAY_COLOR: string;
    ACCENT_COLOR: string;
    ORIGINAL_CAMERA_POSITION: null;
    STORE_DEFAULT_COLOR: string;
    MAP_BACKGROUND_COLOR: string;
    DEVICE: "display_app" | "desktop" | "tablet" | "mobile";
}