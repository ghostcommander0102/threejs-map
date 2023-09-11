import { Group, Texture, Vector3 } from "three";
export type IRetailer = {
    id: string;
    index?: string;
    retail_name: string;
    slug: string;
    location: string;
    retailer_phone: string;
    retailer_description: string;
    logo: string;
    map_obj_name: string;
};
export type MapObj = {
    id: string | number;
    center_id: string;
    retailer_id: string;
    kiosk_id: string | null;
    map_obj_name: string;
    obj_type: string;
    layer_type: string;
    value: string;
    custom_text: string;
    custom_image: string;
    hover_text: string;
    bg_color: string;
    transparent: string | number;
    text_color: string;
    size: string;
    rotate: string;
    offsetX: string;
    offsetY: string;
    goToFloor?: Function;
};
export type Floor = {
    id: string;
    svg_map?: string;
    objsGroup?: Group;
    interactiveObjs?: any[];
    escalatorsObjs?: any[];
    escalatorsNodes?: Record<any, any>;
    escalatorMeshes?: any[];
    route_points?: IRoutePoint[];
    route_tube?: any;
    route_texture?: Texture | null | undefined;
    routeMeshes?: any[];
    route_active?: boolean;
    center_id?: string;
    title: string;
    svg?: string;
    status?: string;
    created_at?: string;
};
export type CameraControlsState = {
    camera: null;
    controls: null;
};
export type Settings = {
    MAP_BACKGROUND_COLOR: string;
    ACCENT_COLOR: string;
    STORE_DEFAULT_COLOR: string;
    BIG_STORE_DEFAULT_COLOR: string;
    WALL_THICKNESS: string;
    WALL_COLOR: string;
    BOUNDARY_THICKNESS: string;
    BOUNDARY_COLOR: string;
    BASE_COLOR: string;
    STORE_TEXT_COLOR: string;
    OVERLAY_COLOR: string;
    OVERLAY_OPACITY: string;
    AMENITIES_NAV_BG_COLOR: string;
    AMENITIES_NAV_ICON_COLOR: string;
};
export type Kiosk = {
    id: string;
    title: string;
    map_obj_name: string;
};
export type Amenity = {
    name: string;
    image: string;
};
export type MapIt2Response = {
    retailers: IRetailer[];
    map_objs: MapObj[];
    floors: Floor[];
    camera_controls_states: {
        display_app: CameraControlsState;
        desktop: CameraControlsState;
        tablet: CameraControlsState;
        mobile: CameraControlsState;
    };
    settings: Settings;
    kiosks: Kiosk[];
    amenities: Record<string, Amenity>;
};
export type IRoutePoint = {
    name: string;
    node: Vector3;
};
export declare function isMapIt2Response(obj: unknown): obj is MapIt2Response;
