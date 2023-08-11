import {IConfig} from "./types";
import {Settings} from "./mapitApiTypes";

export const mapit2DefaultVars: Partial<IConfig> = {
    PAGE_LOADED: true,
    ROLE: 'WEBSITE',
    DEVICE: 'display_app',
    CENTER_ID: '8',
    KIOSK: '51',
    STYLE: '2D',
    DEFAULT_SELECTED_STORE: '0',
    DEBUG: 1,

    MAP_BACKGROUND_COLOR: "FFFFFF",
    ACCENT_COLOR: "4EA5FF",
    STORE_DEFAULT_COLOR: "E2E2E2",
    BIG_STORE_DEFAULT_COLOR: "3D3D3D",
    WALL_THICKNESS: 0.6,
    WALL_COLOR: "888888",
    BOUNDARY_THICKNESS: 0.8,
    BOUNDARY_COLOR: "888888",
    BASE_COLOR: "25292B",
    STORE_TEXT_COLOR: "222222",
    OVERLAY_COLOR: "FFFFFF",
    OVERLAY_OPACITY: 0.7,
    // AMENITIES_NAV_BG_COLOR: "000000",
    // AMENITIES_NAV_ICON_COLOR: "FFFFFF"
}

export const defaultVars: IConfig = {
    MAP_BACKGROUND_COLOR: '',
    ROLE: 'WEBSITE', // PORTAL, WEBSITE, DISPLAY_APP, WP_SITE, PORTAL_KIOSK, PORTAL_RESPONSIVE
    DEVICE: 'display_app',
    MAP_LOADED: false,
    PAGE_LOADED: false,
    KIOSK: '1',
    FLOORS: [],
    CENTER_ID: null,
    STATS: false,
    STYLE: '2D', // 2D, 3D
    DEBUG: 0,
    ACCENT_COLOR: '#4EA5FF',
    STORE_DEFAULT_COLOR: '#E2E2E2',
    BIG_STORE_DEFAULT_COLOR: '#3D3D3D',
    WALL_THICKNESS: 0.6,
    BOUNDARY_THICKNESS: 0.8,
    WALL_COLOR: '#888888',
    BOUNDARY_COLOR: '#888888',
    BASE_COLOR: '#25292B',
    BUILDING_BASE_COLOR: '#DADADA',
    STORE_TEXT_COLOR: '#222222',
    OVERLAY_COLOR: '#FFFFFF',
    OVERLAY_OPACITY: 0.7,
    CAMERA: null, // global camera object so it can be accessible outside this file
    CONTROLS: null, // global controls object so it can be accessible outside this file
    CAMERA_CONTROLS_STATES: null, // all devices camera and controls states
    ORIGINAL_CAMERA_POSITION: null, // loaded and fit to canvas loaded area without any custom positions
    DEFAULT_CAMERA_POSITION: null, // custom default camera position
    DEFAULT_CONTROLS_TARGET: null, // custom default controls target
    DEFAULT_SELECTED_STORE: null,
};