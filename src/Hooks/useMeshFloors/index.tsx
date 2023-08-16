import {
    Color,
    Vector3,
    Euler,
    MeshBasicMaterial,
    BoxGeometry,
    ExtrudeGeometry,
    ShapeGeometry,
    MeshLambertMaterial,
    MeshLambertMaterialParameters,
    DoubleSide,
    Material,
    Shape,
    Mesh,
    Group,
    Vector2,
    Scene,
    Object3D,
} from "three";
import { useLoader } from "@react-three/fiber";
import { SVGLoader, SVGResultPaths } from "three/examples/jsm/loaders/SVGLoader";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";
import { useCallback, useEffect, useState } from "react";
import data from "demo/data.json";
import createGraph, { Graph } from "ngraph.graph";
import {loadFloors} from "./loadFloors";
import {getWallShape} from "./getWallShape";
import type {IConfig, IExtMesh, IMeshParams} from "./types";
import {defaultVars, mapit2DefaultVars} from "./defaults";
import {allIndexedMapObjects, allIndexedRetailers} from "./globals";
import {MapIt2Response, MapObj, Settings} from "./mapitApiTypes";
import {drawTextLogoStoreOnMap, get_store_name_logo_geo} from "helpers/draw.logo.helpers";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";



// if (!isDefined(typeof MAPIT2)) window.MAPIT2 = { ...defaultVars };
// window.MAPIT2 = { ...defaultVars, ...MAPIT2 };

const config: IConfig = { ...defaultVars, ...mapit2DefaultVars}

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
};


let allNonIndexedMapObjects: MapObj[] = [];
let textLogoLayerAddedIndex = 0;

const extraMapObjects = []
let activeMapObjectName = null;
const floors = [] as any[];
let floors_loaded = 0;
const BASE_URL = '/';
let node_count = 0;


const clearObject = (obj: Record<any, any>) => {
	for (let key in obj) {
		delete obj[key];
	}
}

function makeIndexedMapObjects(map_objs: MapObj[]) {
	clearObject(allIndexedMapObjects);

    allNonIndexedMapObjects = map_objs;

    for (let i = 0; i < map_objs.length; i++) {
        const obj = map_objs[i];
        //@ts-ignore
        allIndexedMapObjects[obj.map_obj_name] = obj;
        for (let key in defaultMapObjValues) {
            //@ts-ignore
            const value = defaultMapObjValues[key];
            //@ts-ignore
            if (value != null && obj[key] == null) {
                //@ts-ignore
                allIndexedMapObjects[obj.map_obj_name][key] = value;
            }
        }
    }
}

const start_the_show = (response: MapIt2Response) => {
    config.FLOORS = response.floors;
    config.CAMERA_CONTROLS_STATES = response.camera_controls_states[config.DEVICE];

    config.MAP_BACKGROUND_COLOR = response.settings.MAP_BACKGROUND_COLOR;
    config.ACCENT_COLOR = response.settings.ACCENT_COLOR;
    config.STORE_DEFAULT_COLOR = response.settings.STORE_DEFAULT_COLOR;
    config.BIG_STORE_DEFAULT_COLOR = response.settings.BIG_STORE_DEFAULT_COLOR;
    config.WALL_THICKNESS = parseFloat(response.settings.WALL_THICKNESS);
    config.WALL_COLOR = response.settings.WALL_COLOR;
    config.BOUNDARY_THICKNESS = parseFloat(response.settings.BOUNDARY_THICKNESS);
    config.BOUNDARY_COLOR = response.settings.BOUNDARY_COLOR;
    config.BASE_COLOR = response.settings.BASE_COLOR;
    config.STORE_TEXT_COLOR = response.settings.STORE_TEXT_COLOR;
    config.OVERLAY_COLOR = response.settings.OVERLAY_COLOR;
    config.OVERLAY_OPACITY = parseFloat(response.settings.OVERLAY_OPACITY);
    // config.AMENITIES_NAV_BG_COLOR = response.settings.AMENITIES_NAV_BG_COLOR;
    // config.AMENITIES_NAV_ICON_COLOR = response.settings.AMENITIES_NAV_ICON_COLOR;


    for (let index in response.retailers) {
        const retailer = response.retailers[index];
        allIndexedRetailers[retailer.id] = retailer;
        allIndexedRetailers[retailer.id].index = index;
    }

    // ngCtrlElem.scope().amenitiesNav.bg_color = response.settings.AMENITIES_NAV_BG_COLOR;
    // ngCtrlElem.scope().amenitiesNav.icon_color = response.settings.AMENITIES_NAV_ICON_COLOR;

    makeIndexedMapObjects(response.map_objs);

    init();
    // animate();
}
const init = () => {

        config.FLOORS.forEach((index: any, value: any) => {
			floors.push({
				id: value.id,
				svg_map: BASE_URL + 'data/mapit2/' + value.svg,
				title: value.title,
				objsGroup: new Group(),
				interactiveObjs: [],
				escalatorsObjs: [],
				escalatorsNodes: {},
				escalatorMeshes: [],
				route_points: [],
				route_tube: null,
				route_texture: null,
				routeMeshes: [],
				route_active: false,
			});
        });

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


const useMeshFloors = (url: string): IMeshParams => {
    const [meshParams, setMeshParams] = useState<any[]>([]);
    const [textParams, setTextParams] = useState<any[]>([]);
    const [storeLogos, setStoreLogos] = useState<any[]>([]);
    const [pathFinderGraph, setPathFinderGraph] = useState<any>();
    const GeometriesAndMaterials: any[] = [];
    const result = useLoader(SVGLoader, '/data/mapit2/floor-14.svg');
    const consolePrefix = 'MAPIT2';
    const myFont = useLoader(FontLoader, 'assets/threejs/threejs/examples/fonts/optimer_regular.typeface.json')
    // const getWallShape = (...params: any): Shape | Shape[] => {
    //     return []
    // }

    const handleAsyncStoreLogos = useCallback((meshLogo: Object3D) => {
        setStoreLogos((prevLogos) => {
            return [...prevLogos, {...meshLogo}];
        });
    }, [])

    useEffect(() => {
        start_the_show(data as MapIt2Response);
        const { GeometriesAndMaterials, graph } = loadFloors(floors, floors_loaded, config, result);
        const TextsAndLogos:{textMesh:IExtMesh}[] = [];
        allNonIndexedMapObjects.forEach((params) => {
            const textLogoNamePrefix = 'custom-layer-';
            const values = GeometriesAndMaterials.find(item => item.object_id === params.map_obj_name);
            if (!values) return null;

            const textParams = get_store_name_logo_geo(values.geometry, params.map_obj_name, values.floor_index, textLogoNamePrefix, allIndexedMapObjects, allIndexedRetailers, config, myFont, floors, handleAsyncStoreLogos);
            if (textParams) TextsAndLogos.push(textParams);
        })
        setMeshParams(GeometriesAndMaterials);
        setTextParams(TextsAndLogos);
        setPathFinderGraph(graph);
    }, []);
    return {
        config,
        meshParams,
        textParams,
        storeLogos,
        floors,
        drawText: (scene: Scene) => drawTextLogoStoreOnMap(allNonIndexedMapObjects, scene, '', allIndexedMapObjects, allIndexedRetailers, config, myFont, floors),
        pathFinderGraph
    };
}

export default useMeshFloors