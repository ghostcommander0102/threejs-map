import {
    Group,
    Scene,
    Object3D,
    Mesh,
    BufferGeometry,
    Color,
} from "three";
import { useLoader } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import {useCallback, useEffect, useMemo, useState} from "react";
import createGraph, { Graph } from "ngraph.graph";
import data from "demo/data.json";
import {loadFloors} from "./loadFloors";
import type {IConfig, IExtMesh, IFloorData, IMeshParams, IMeshValues} from "../../types";
import {defaultVars, mapit2DefaultVars} from "../../defaults";
import {allIndexedMapObjects, allIndexedRetailers} from "../../globals";
import {drawTextLogoStoreOnMap, get_store_name_logo_geo} from "helpers/draw.logo.helpers";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { IJsonConfig, IMeshParamsTmp} from "../../types";
import {hex_to_color} from "../../helpers/misc";
import {Kiosk, Floor, MapIt2Response, MapObj} from "../../mapitApiTypes";
import { EventedType } from "ngraph.events";

// if (!isDefined(typeof MAPIT2)) window.MAPIT2 = { ...defaultVars };
// window.MAPIT2 = { ...defaultVars, ...MAPIT2 };

const config: IJsonConfig = { ...defaultVars, ...mapit2DefaultVars}

const defaultMapObjValues = {
	id: null,
	center_id: config.CENTER_ID,
	retailer_id: null,
	kiosk_id: null,
	map_obj_name: '',
	obj_type: 'retailer',
	layer_type: 'retail_name',
	value: '',
	custom_text: '',
	custom_image: '',
	hover_text: '',
	bg_color: '',
	transparent: 0,
	text_color: '',
	size: 8,
	rotate: 0,
	offsetX: 0,
	offsetY: 0,
} as Record<string, string | number | null| undefined>;


let allNonIndexedMapObjects: MapObj[] = [];

const extraMapObjects = []
let activeMapObjectName = null;
const floorsData:IFloorData[] = [];
const floors = [] as Floor[];
let floors_loaded = 0;
const BASE_URL = '/';

function select<T>(...values: T[]) {
    return values.find(value => value !== '' && value != null) || values.at(-1);
}

const clearObject = (obj: Record<string, MapObj>) => {
	for (let key in obj) {
		delete obj[key];
	}
}

function makeIndexedMapObjects(map_objs: MapObj[]) {
	clearObject(allIndexedMapObjects);

    allNonIndexedMapObjects = map_objs;

    for (let i = 0; i < map_objs.length; i++) {
        const obj = map_objs[i];
        allIndexedMapObjects[obj.map_obj_name] = obj;
        for (let key in defaultMapObjValues) {
            const value = defaultMapObjValues[key];
            //@ts-ignore
            if (value != null && obj[key] == null) {
                //@ts-ignore
                allIndexedMapObjects[obj.map_obj_name][key] = value;
            }
        }
    }
}

const init = (config: IJsonConfig, floors:IFloorData[], response: MapIt2Response) => {

    const KIOSKS:Record<string, Kiosk> = {};
    response.kiosks.forEach((kiosk) => {
        KIOSKS[kiosk.id] = kiosk;
    });


    for (let index in response.retailers) {
        const retailer = response.retailers[index];
        allIndexedRetailers[retailer.id] = retailer;
        allIndexedRetailers[retailer.id].index = index;
    }

    // ngCtrlElem.scope().amenitiesNav.bg_color = response.settings.AMENITIES_NAV_BG_COLOR;
    // ngCtrlElem.scope().amenitiesNav.icon_color = response.settings.AMENITIES_NAV_ICON_COLOR;

    makeIndexedMapObjects(response.map_objs);

    floors.length = 0;
    response.floors.forEach((value: IFloorData, index: number) => {
        const objsGroup = new Group();
        objsGroup.scale.y *= -1;
        objsGroup.lookAt(0, 1, 0);

        floors.push({
            id: value.id,
            svg_map: BASE_URL + 'data/mapit2/' + value.svg,
            title: value.title,
            objsGroup: objsGroup,
            interactiveObjs: [],
            escalatorsObjs: [],
            escalatorsNodes: {},
            escalatorMeshes: [],
            route_points: [],
            route_tube: undefined,
            route_texture: null,
            routeMeshes: [],
            route_active: false,
        });
    });

    const processedConfig: IConfig = {
        ACCENT_COLOR: hex_to_color(response.settings.ACCENT_COLOR ? response.settings.ACCENT_COLOR : config.ACCENT_COLOR),
        BASE_COLOR: hex_to_color(response.settings.BASE_COLOR ? response.settings.BASE_COLOR : config.BASE_COLOR),
        BIG_STORE_DEFAULT_COLOR: hex_to_color(response.settings.BIG_STORE_DEFAULT_COLOR ? response.settings.BIG_STORE_DEFAULT_COLOR : config.BIG_STORE_DEFAULT_COLOR),
        BOUNDARY_COLOR: hex_to_color(response.settings.BOUNDARY_COLOR ? response.settings.BOUNDARY_COLOR : config.BOUNDARY_COLOR),
        BOUNDARY_THICKNESS: parseFloat(response.settings.BOUNDARY_THICKNESS ? response.settings.BOUNDARY_THICKNESS : config.BOUNDARY_THICKNESS),
        BUILDING_BASE_COLOR: hex_to_color(config.BUILDING_BASE_COLOR),
        CAMERA: null,
        CAMERA_CONTROLS_STATES: response.camera_controls_states[config.DEVICE],
        CENTER_ID: config.CENTER_ID,
        CONTROLS: null,
        DEBUG: config.DEBUG, // config.DEBUG === 'true' || config.DEBUG === '1'
        DEFAULT_CAMERA_POSITION: config.DEFAULT_CAMERA_POSITION,
        DEFAULT_CONTROLS_TARGET: config.DEFAULT_CONTROLS_TARGET,
        DEFAULT_SELECTED_STORE: config.DEFAULT_SELECTED_STORE,
        DEVICE: config.DEVICE,
        KIOSK: config.KIOSK,
        KIOSKS: KIOSKS,
        MAP_BACKGROUND_COLOR: hex_to_color(response.settings.MAP_BACKGROUND_COLOR ? response.settings.MAP_BACKGROUND_COLOR : config.MAP_BACKGROUND_COLOR),
        ORIGINAL_CAMERA_POSITION: config.ORIGINAL_CAMERA_POSITION,
        OVERLAY_COLOR: hex_to_color(response.settings.OVERLAY_COLOR ? response.settings.OVERLAY_COLOR : config.OVERLAY_COLOR),
        OVERLAY_OPACITY: parseFloat(response.settings.OVERLAY_OPACITY ? response.settings.OVERLAY_OPACITY : config.OVERLAY_OPACITY),
        ROLE: config.ROLE,
        STATS: config.STATS === 'true' || config.STATS === '1',
        STORE_DEFAULT_COLOR: hex_to_color(response.settings.STORE_DEFAULT_COLOR ? response.settings.STORE_DEFAULT_COLOR : config.STORE_DEFAULT_COLOR),
        STORE_TEXT_COLOR: hex_to_color(response.settings.STORE_TEXT_COLOR ? response.settings.STORE_TEXT_COLOR : config.STORE_TEXT_COLOR),
        STYLE: config.STYLE,
        WALL_COLOR: hex_to_color(response.settings.WALL_COLOR ? response.settings.WALL_COLOR : config.WALL_COLOR),
        WALL_THICKNESS: parseFloat(response.settings.WALL_THICKNESS ? response.settings.WALL_THICKNESS : config.WALL_THICKNESS),
        FLOORS: response.floors,
        AMENITIES: response.amenities,
        RETAILERS: response.retailers
    };

    // AMENITIES_NAV_BG_COLOR: string;
    // AMENITIES_NAV_ICON_COLOR: string;

    return processedConfig;
}

/*function get_node_name(vertex: any, floor_index: any) {
    let exists = false;
    let node_name = null;
    for (let i = 0; i < floors[floor_index].route_points.length; i++) {
        if (vertex.x == floors[floor_index].route_points[i].node.x && vertex.y === floors[floor_index].route_points[i].node.y) {
            exists = true;
            node_name = floors[floor_index].route_points[i].name;
            break;
        }
    }
    if (!exists) {
        node_name = next_node_name();
        floors[floor_index].route_points.push({
            name: node_name,
            node: new Vector3(vertex.x, vertex.y, 1)
        });
        //@ts-ignore
        allNodesFloor[node_name] = floor_index;

        // draw_points([{ x: vertex.x, y: vertex.y }]);
    }
    return node_name;
}*/

/*function next_node_name() {
    node_count++;
    return 'node-' + node_count;
}*/


const useMeshFloors = (data: MapIt2Response|null, jsonConfig?:IJsonConfig): IMeshParamsTmp => {
    const [meshParams, setMeshParams] = useState<IMeshValues[][]>([]);
    const [textParams, setTextParams] = useState<Array<{textMesh:IExtMesh}[]>>([]);
    const [storeLogos, setStoreLogos] = useState<{storeLogo: Mesh}[][]>([]);
    const [pathFinderGraph, setPathFinderGraph] = useState<Graph & EventedType>();
    const [escalatorNodes, setEscalatorNodes] = useState<string[]>([]);
    const [urls, setUrls] = useState<string[]>([]);
    const [ processedConfig, setProcessedConfig ] = useState<IConfig|null>(null);
    let result = useLoader(SVGLoader, urls);

    const consolePrefix = 'MAPIT2';
    const myFont = useLoader(FontLoader, 'assets/threejs/threejs/examples/fonts/optimer_regular.typeface.json')

    // const getWallShape = (...params: any): Shape | Shape[] => {
    //     return []
    // }


    const handleAsyncStoreLogos = useCallback((floorIndex: number) => ((meshLogo: {storeLogo: Mesh}) => {
        setStoreLogos((prevLogos) => {
            // console.debug({floorIndex});
            if (prevLogos[floorIndex]) {
                prevLogos[floorIndex].push({...meshLogo});
            } else {
                prevLogos[floorIndex] = [{...meshLogo}];
            }
            // console.debug({prevLogos});
            return [...prevLogos];
        });
    }), [])


    useEffect(() => {
        if (!data) return;

        // console.log('useMeshFloors[data]', {data})

        const processedConfig = init(jsonConfig ?? config, floorsData, data as MapIt2Response);
        const values: string[] = [];
        processedConfig.FLOORS.forEach((value) => {
            values.push(`/data/mapit2/${value.svg}`);
        });

        setProcessedConfig(processedConfig);
        setUrls([...values]);
    }, [data]);

    useEffect(() => {
        if (!processedConfig || !urls.length || !myFont || !result) return;

        const { GeometriesAndMaterials, graph, escalator_nodes } = loadFloors(floorsData, processedConfig, result);
        const TextsAndLogos:Array<{textMesh:IExtMesh}[]> = [];
        allNonIndexedMapObjects.forEach((params) => {
            const textLogoNamePrefix = 'custom-layer-';
            let values: IMeshValues | undefined;
            for (let i = 0; i < GeometriesAndMaterials.length; i++) {
                //@ts-ignore
                values = GeometriesAndMaterials[i].find(item => item.object_id === params.map_obj_name);
                if (values !== undefined) {
                    break;
                } 
            }
            if (!values) return null;
            const textParams = get_store_name_logo_geo(values.geometry, params.map_obj_name, values.floor_index, textLogoNamePrefix, allIndexedMapObjects, allIndexedRetailers, config, myFont, floorsData, handleAsyncStoreLogos(values.floor_index));
            if (textParams) {
                if (!TextsAndLogos[values.floor_index]) {
                    TextsAndLogos[values.floor_index] = [];
                }
                TextsAndLogos[values.floor_index].push(textParams);
            }
        })
        setMeshParams(GeometriesAndMaterials);
        setTextParams(TextsAndLogos);
        setPathFinderGraph(graph);
        setEscalatorNodes([...escalator_nodes]);

    }, [processedConfig, urls, result, myFont]);

    return useMemo(() => {
        return {
            config: processedConfig,
            meshParams,
            textParams,
            storeLogos,
            floors: floorsData,
            pathFinderGraph,
            escalator_nodes: escalatorNodes,
        }
    }, [ processedConfig, meshParams, textParams, storeLogos, floorsData, pathFinderGraph, escalatorNodes ])
}

export default useMeshFloors