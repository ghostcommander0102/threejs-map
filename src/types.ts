import type {Color, Group, Material, Mesh, MeshLambertMaterial, ShapeGeometry} from "three";
import {Amenity, CameraControlsState, Floor, Kiosk, IRetailer} from "./mapitApiTypes";
import {Graph} from "ngraph.graph";
import type {Texture, Vector3} from "three";
import type {IRoutePoint, MapObj} from "./mapitApiTypes";
import { IntersectionEvent,  } from "@react-three/fiber/dist/declarations/src/core/events";
import { Properties } from "@react-three/fiber/dist/declarations/src/three-types";
import { MouseEventHandler } from "react";

export interface IMeshValues {
    mesh: IExtMesh;
    geometry: ShapeGeometry;
    material: Material;
    object_id: string;
    mesh_type: string | null;
    floor_index: number;
    visible: boolean;
    renderOrder: number;
    route_node_id?: string | null;
}

export interface IMeshParams {
    config: IConfig;
    meshParams: IMeshValues[][];
    textParams: { textMesh: IExtMesh }[][];
    storeLogos: { storeLogo: IExtMesh }[][];
    floors: IFloorData[];
    drawText?: Function;
    pathFinderGraph: Graph<any, any>;
    escalator_nodes: string[];
}

export interface IMeshParamsTmp {
    config: IConfig | null;
    meshParams: IMeshValues[][];
    textParams: { textMesh: IExtMesh }[][];
    storeLogos: { storeLogo: IExtMesh }[][];
    floors: IFloorData[];
    drawText?: Function;
    pathFinderGraph?: Graph;
    escalator_nodes: string[];
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
    goToFloor?: {
        index: number;
        direction: string;
    };
}

export interface IExtShapeGeometry extends ShapeGeometry {
    faces: Vector3[];
}

export interface IFloorData {
    id: string,
    svg?: string,
    svg_map?: string,
    title: string,
    objsGroup?: Group,
    interactiveObjs?: IExtMesh[],
    escalatorsObjs?: IExtMesh[],
    escalatorsNodes?: Record<string, string>,
    escalatorMeshes?: IExtMesh[],
    route_points?: IRoutePoint[],
    route_tube?: IExtMesh,
    route_texture?: Texture | null,
    routeMeshes?: IExtMesh[],
    route_active?: boolean
}

export interface IJsonConfig {
    BUILDING_BASE_COLOR: string;
    BASE_COLOR: string;
    STATS: string;
    KIOSK: string;
    KIOSKS: Record<string, Kiosk>;
    OVERLAY_OPACITY: string;
    DEFAULT_CAMERA_POSITION: null;
    BOUNDARY_THICKNESS: string;
    BIG_STORE_DEFAULT_COLOR: string;
    STORE_TEXT_COLOR: string;
    WALL_THICKNESS: string;
    CENTER_ID: string | null;
    ROLE: string;
    DEFAULT_SELECTED_STORE: string | null;
    CAMERA_CONTROLS_STATES: CameraControlsState | null;
    FLOORS: Floor[];
    STYLE: ConfigStyleType;
    BOUNDARY_COLOR: string;
    DEFAULT_CONTROLS_TARGET: null;
    DEBUG: string;
    WALL_COLOR: string;
    OVERLAY_COLOR: string;
    ACCENT_COLOR: string;
    ORIGINAL_CAMERA_POSITION: null;
    STORE_DEFAULT_COLOR: string;
    MAP_BACKGROUND_COLOR: string;
    DEVICE: ConfigDeviceType;
}

export interface IConfig {
    BUILDING_BASE_COLOR: Color;
    BASE_COLOR: Color;
    STATS: boolean;
    KIOSK: string;
    KIOSKS: Record<string, Kiosk>;
    OVERLAY_OPACITY: number;
    DEFAULT_CAMERA_POSITION: null;
    BOUNDARY_THICKNESS: number;
    BIG_STORE_DEFAULT_COLOR: Color;
    STORE_TEXT_COLOR: Color;
    WALL_THICKNESS: number;
    CENTER_ID: string | null;
    ROLE: string;
    DEFAULT_SELECTED_STORE: string | null;
    CAMERA_CONTROLS_STATES: CameraControlsState | null;
    FLOORS: Floor[];
    STYLE: ConfigStyleType;
    BOUNDARY_COLOR: Color;
    CAMERA: null;
    DEFAULT_CONTROLS_TARGET: null;
    DEBUG: string | number;
    CONTROLS: null;
    WALL_COLOR: Color;
    OVERLAY_COLOR: Color;
    ACCENT_COLOR: Color;
    ORIGINAL_CAMERA_POSITION: null;
    STORE_DEFAULT_COLOR: Color;
    MAP_BACKGROUND_COLOR: Color;
    DEVICE: ConfigDeviceType;
    RETAILERS: IRetailer[];
    AMENITIES: Record<string, Amenity>;
}

export type ConfigStyleType = "2D" | "3D";

export type ConfigDeviceType = "display_app" | "desktop" | "tablet" | "mobile";

export interface ICameraPropertiesProps {
    far?: number;
    near?: number;
    fov?: number;
    aspectRatio?: number;
    position?: Vector3;
}

export interface ExIntersection extends THREE.Intersection {
    eventObject: THREE.Object3D | IExtMesh;
}
export type ExThreeEvent<TEvent> = IntersectionEvent<TEvent> & Properties<TEvent> & ExIntersection;

export interface IFloorSelectorProps {
    floors: IFloorData[],
    selectedFloorIndex: number,
    handleFloorChange: (floorIndex: number) => MouseEventHandler<HTMLDivElement>
    accentColor: string,
}

export interface IAmenitiesInteractiveList {
    name: string,
    imageUrl: string,
    type: string;
}

export type TMapMode = 'view' | 'edit';
