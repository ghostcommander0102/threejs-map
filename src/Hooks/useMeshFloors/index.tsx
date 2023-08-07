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
} from "three";
import { useLoader } from "@react-three/fiber";
import { SVGLoader, SVGResultPaths } from "three/examples/jsm/loaders/SVGLoader";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";
import { useEffect, useState } from "react";
import data from "demo/data.json";
import createGraph, { Graph } from "ngraph.graph";

interface IMeshValues {
    geometry: ShapeGeometry,
    material: Material,
}

interface IMeshParams {
    meshParams: IMeshValues[],
}

interface IExtMeshLambertMaterial extends MeshLambertMaterial {
    colorDefault?: Color,
    active?: boolean,
}

interface IExtMesh extends Mesh {
    object_id?: string | null,
    mesh_type?: string | null,
    floor_index?: number,
    route_node_id?: string | null,
    escalator_id?: string | null,
}

interface IExtShapeGeometry extends ShapeGeometry {
    faces: any[],
}

function next_node_name(node_count: number) {
	return 'node-' + node_count;
}
function getWallShape(curve: any, thickness = 3, shape_extend = 0) {
	let wallShape = new Shape();
	let point1 = new Vector3(curve.v1.x, curve.v1.y, 0);
	let point2 = new Vector3(curve.v2.x, curve.v2.y, 0);

	// form help and formulas in /assets/threejs/help/
	let dir = point2.clone().sub(point1).normalize().multiplyScalar(-thickness * shape_extend);
	let point1_center = point1.clone().add(dir);

	dir = point1.clone().sub(point2).normalize().multiplyScalar(-thickness * shape_extend);
	let point2_center = point2.clone().add(dir);

	let distance = point1.distanceTo(point2_center);

	let point1_above = {
		x: point1_center.x - (point2.y - point1_center.y) * thickness / distance,
		y: point1_center.y - (point1_center.x - point2.x) * thickness / distance
	};
	let point1_below = {
		x: point1_center.x + (point2.y - point1_center.y) * thickness / distance,
		y: point1_center.y + (point1_center.x - point2.x) * thickness / distance
	};

	let point2_above = {
		x: point2_center.x + (point1.y - point2_center.y) * thickness / distance,
		y: point2_center.y + (point2_center.x - point1.x) * thickness / distance
	};
	let point2_below = {
		x: point2_center.x - (point1.y - point2_center.y) * thickness / distance,
		y: point2_center.y - (point2_center.x - point1.x) * thickness / distance
	};

	wallShape.moveTo(point1_above.x, point1_above.y);
	wallShape.lineTo(point1_below.x, point1_below.y);
	wallShape.lineTo(point2_below.x, point2_below.y);
	wallShape.lineTo(point2_above.x, point2_above.y);

	// shape.moveTo(point1_above.x, point1_above.y);
	// shape.bezierCurveTo(point1_above.x, point1_above.y, point1_long_center.x, point1_long_center.y, point1_below.x, point1_below.y);
	// shape.lineTo(point2_below.x, point2_below.y);
	// shape.bezierCurveTo(point2_below.x, point2_below.y, point2_long_center.x, point2_long_center.y, point2_above.x, point2_above.y);

	return wallShape;
}

function get_node_name(vertex: Vector2, floor_index: number, floors: any[], node_count: number) {
	let exists = false;
	let node_name = null;
	for (let i = 0; i < floors[floor_index].route_points.length; i++) {
		if (vertex.x == floors[floor_index].route_points[i].node.x && vertex.y == floors[floor_index].route_points[i].node.y) {
			exists = true;
			node_name = floors[floor_index].route_points[i].name;
			break;
		}
	}
	if (!exists) {
		node_name = next_node_name(node_count);
		// draw_points([{ x: vertex.x, y: vertex.y }]);
	}
	return [node_name, exists];
}

const getMeshParams = (path: any, paths: SVGResultPaths[], floors: any[], floor_index: number, config: any, nodeCount: number, allNodesFloor: any[], pathFinderGraph: Graph) => {
    const consolePrefix = 'MeshParams';

	var mesh_type = null;
	var layer_color = path.color;
	var extrude = 0;
	var z_index = 0;
	var mesh_visible = true;
	var mesh_draw = true;
	var mesh_transparent = false;
	var line_thickness = config.WALL_THICKNESS;
	var interactiveMesh = true;
	var layer_name = path.userData.node.id;
	if (layer_name != undefined) {
		if (layer_name.startsWith('boundary')) {
			mesh_type = 'boundary';
			layer_color = config.BOUNDARY_COLOR;
			line_thickness = config.BOUNDARY_THICKNESS;
			if (config.STYLE == '3D') {
				extrude = 9;
			}
		} else if (layer_name.startsWith('wall')) {
			mesh_type = 'wall';
			layer_color = config.WALL_COLOR;
			if (config.STYLE == '3D') {
				extrude = 8.5;
			}
		} else if (layer_name.startsWith('outer-wall')) {
			mesh_type = 'outer-wall';
			layer_color = config.WALL_COLOR;
			if (config.STYLE == '3D') {
				mesh_draw = false;
			}
		} else if (layer_name.startsWith('building-base')) {
			mesh_type = 'building-base';
			layer_color = config.BUILDING_BASE_COLOR;
			if (config.STYLE == '3D') {
				extrude = 12;
				z_index = -12;
			}
		} else if (layer_name.startsWith('base')) {
			mesh_type = 'base';
			layer_color = config.BASE_COLOR;
		} else if (layer_name.startsWith('store')) {
			mesh_type = 'store';
			layer_color = config.STORE_DEFAULT_COLOR;
			if (config.STYLE == '3D') {
				extrude = 8;
			}
			if (layer_name.startsWith('store-underlay')) {
				interactiveMesh = false;
			}
		} else if (layer_name.startsWith('big-store')) {
			mesh_type = 'big-store';
			layer_color = config.BIG_STORE_DEFAULT_COLOR;
			if (config.STYLE == '3D') {
				extrude = 16;
			}
		} else if (layer_name.startsWith('route-path')) {
			mesh_type = 'route-path';
			mesh_draw = false;
            //@ts-ignore
			path.subPaths.forEach(subPath => {
				if (subPath.curves.length == 0) {
					console.warn(consolePrefix + 'Route-path standalone anchor point exists, layer_name: "%s"', layer_name);
				}
                //@ts-ignore
				subPath.curves.forEach(curve => {
					const [node1_name, exists1] = get_node_name(curve.v1, floor_index, floors, nodeCount);
					if (!exists1) {
						floors[floor_index].route_points.push({
							name: node1_name,
							node: new Vector3(curve.v1.x, curve.v1.y, 1)
						});
						allNodesFloor[node1_name] = floor_index;
					}
					const [node2_name, exists2] = get_node_name(curve.v2, floor_index, floors, nodeCount);
					if (!exists2) {
						floors[floor_index].route_points.push({
							name: node2_name,
							node: new Vector3(curve.v2.x, curve.v2.y, 1)
						});
						allNodesFloor[node2_name] = floor_index;
					}
					pathFinderGraph.addNode(node1_name, { ...curve.v1 });
					pathFinderGraph.addNode(node2_name, { ...curve.v2 });

					// pathFinderGraph.addLink(node1_name, node2_name);
					pathFinderGraph.addLink(node1_name, node2_name, { weight: curve.v1.distanceTo(curve.v2) });
					pathFinderGraph.addLink(node2_name, node1_name, { weight: curve.v1.distanceTo(curve.v2) });
				});
			});
		} else if (layer_name.startsWith('escalator-')) {
			mesh_type = 'escalator';
			mesh_visible = false;
		} else if (layer_name.startsWith('kiosk-')) {
			mesh_type = 'kiosk';
			mesh_transparent = true;
		} else if (layer_name.startsWith('amenity-')) {
			mesh_type = 'amenity';
			mesh_transparent = true;
			z_index = 1;
		} else if (layer_name.startsWith('overlay')) {
			mesh_type = 'overlay';
		} else if (layer_name.startsWith('special-shape')) {
			mesh_type = 'special-shape';
		} else {
			extrude = 1;
		}
	}
	console.debug({
		mesh_type,
		layer_color,
		extrude,
		z_index,
		mesh_visible,
		mesh_draw,
		mesh_transparent,
		line_thickness,
		interactiveMesh,
		path,
		layer_name,
	})
	return {
		mesh_type,
		layer_color,
		extrude,
		z_index,
		mesh_visible,
		mesh_draw,
		mesh_transparent,
		line_thickness,
		interactiveMesh,
		path,
		layer_name,
	}
}

const getMaterialAndGeometry = (config: any, mesh_type: string, layer_name: string, layer_color: string, mesh_transparent: boolean, mesh_visible: boolean, z_index: number, extrude: boolean, line_thickness: number, floors: any, floor_index: number, allIndexedMapObjects: any, path: any) => {
    const consolePrefix = 'MaterialAndGeometry';

	let material_settings = {
		color: layer_color,
		side: DoubleSide,
		transparent: true,
        depthWrite: true as boolean | undefined,
        depthTest: true as boolean | undefined,
        opacity: 1 as number | undefined,
	}
	if (config.STYLE == '2D' || mesh_type == 'base' || mesh_type == null) {
		if (mesh_type != 'boundary') {
			material_settings.depthWrite = false;
			material_settings.depthTest = false;
		}
	}
	if (mesh_type == 'overlay') {
		material_settings.color = config.OVERLAY_COLOR;
		material_settings.opacity = config.OVERLAY_OPACITY;
	}
	if (['store', 'big-store', 'kiosk'].includes(mesh_type) && config.ROLE != 'PORTAL' && allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].transparent == 1) {
		material_settings.opacity = 0;
	}
	var material = new MeshLambertMaterial(material_settings);
	if (['store', 'big-store', 'kiosk', 'amenity'].includes(mesh_type)) {
        //@ts-ignore
		material.colorDefault = material.color;
		if (allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].bg_color != '') {
			material.color = hex_to_color(allIndexedMapObjects[layer_name].bg_color);
            //@ts-ignore
			material.colorDefault = material.color;
		}
        //@ts-ignore
		material.active = false;
	}
	if (config.ROLE != 'PORTAL' && mesh_transparent) {
		material.opacity = 0;
	}

	let shapes = path.toShapes(true);

	// shapes.forEach((shape, index) => {
	let extrude_meshes;
	if (config.STYLE == '2D') {
		extrude_meshes = ['building-base'];
	} else {
		extrude_meshes = ['store', 'big-store', 'base', 'building-base'];
	}

	let wall_meshes = ['wall', 'outer-wall', 'boundary'];

	var geometry;
	if (extrude_meshes.includes(mesh_type)) {
		geometry = new ExtrudeGeometry(shapes, {
            //@ts-ignore
			depth: extrude,
			bevelEnabled: false,
		});
	} else if (wall_meshes.includes(mesh_type)) {
        //@ts-ignore
		let wall_geometries = [];
        //@ts-ignore
		path.subPaths.forEach(subPath => {
            //@ts-ignore
			subPath.curves.forEach(curve => {
				if (curve.type == 'LineCurve') {
					let shape_extend = 0;
					if (mesh_type == 'boundary') {
						shape_extend = 1;
					} else if (mesh_type == 'wall') {
						// shape_extend = 1 / 3;
					}
					let shape1 = getWallShape(curve, line_thickness, shape_extend);
					let wall_geometry = new ExtrudeGeometry(shape1, {
                        //@ts-ignore
						depth: extrude,
						bevelEnabled: false,
					});
					wall_geometries.push(wall_geometry);
				} else {
					console.warn(consolePrefix + '"%s" found in walls. Check layer "%s"', curve.type, layer_name);
				}
			});
		});

		if (wall_geometries.length == 1) {
            //@ts-ignore
			geometry = wall_geometries[0];
		} else if (wall_geometries.length > 1) {
            //@ts-ignore
			geometry = mergeGeometries(wall_geometries);
		} else {
			console.warn(consolePrefix + 'Unneccessary wall exists "%s"', layer_name);
		}
	} else {
		geometry = new ShapeGeometry(shapes);
		console.debug({shapes})
        try {
            //@ts-ignore
            if (geometry.attributes.position.count == 0) {
                console.warn(consolePrefix + 'Unneccessary map shape "%s"', layer_name, path.userData.node);
            }
        } catch (e: any) {
            console.error(e.message);
        }
	}

	var mesh = new Mesh(geometry, material);
    //@ts-ignore
	mesh.object_id = layer_name;
    //@ts-ignore
	mesh.mesh_type = mesh_type;
    //@ts-ignore
	mesh.floor_index = floor_index;
	mesh.visible = mesh_visible;
	mesh.position.z = z_index;
	if (config.STYLE == '2D') {
		mesh.renderOrder = getRenderOrder(mesh_type);
		if (layer_name.includes('underlay')) {
			mesh.renderOrder = getRenderOrder('underlay');
		}
	}

	floors[floor_index].objsGroup.add(mesh);

	if (mesh_type == 'escalator') {
		floors[floor_index].escalatorsNodes[layer_name] = null;
		floors[floor_index].escalatorsObjs.push(mesh);
        //@ts-ignore
		mesh.escalator_id = floor_index + '-' + layer_name;
	}

	if (['store', 'big-store', 'kiosk', 'amenity'].includes(mesh_type)) {
        //@ts-ignore
		mesh.route_node_id = null;

		// add floor_index to the kiosks
		if (allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].layer_type == 'kiosk') {
			var kiosk_id = allIndexedMapObjects[layer_name].kiosk_id;
			/*if (kiosk_id != null && ngCtrlElem.scope().kiosks[kiosk_id]) {
				ngCtrlElem.scope().kiosks[kiosk_id].floor_index = floor_index;
			}*/
		}

		if (config.ROLE == 'PORTAL') {
			allMapObjects.push(layer_name);
		}
		if (
			(config.ROLE == 'PORTAL') ||
			(config.ROLE != 'PORTAL' && mesh_type == 'kiosk') ||
			(config.ROLE != 'PORTAL' && config.ROLE != 'PORTAL_KIOSK' && allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].obj_type == 'retailer' && allIndexedMapObjects[layer_name].retailer_id != null) ||
			(config.ROLE != 'PORTAL' && config.ROLE != 'PORTAL_KIOSK' && allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].layer_type == 'amenity' && allIndexedMapObjects[layer_name].value != '')
		) {
			// if (interactiveMesh) {
			floors[floor_index].interactiveObjs.push(mesh);
			// }
		}
	}

	return {
		geometry,
		material,
	}
	// });

}

function hex_to_color(hex_code: string) {
    return new Color(parseInt('0x' + hex_code, 16));
}

const mapit2DefaultVars = {
	PAGE_LOADED: true,
	ROLE: 'WEBSITE',
	DEVICE: 'display_app',
	CENTER_ID: '8',
	KIOSK: '51',
	STYLE: '2D',
	DEFAULT_SELECTED_STORE: '0',
	DEBUG: '1',
}

const defaultVars = {
	MAP_BACKGROUND_COLOR: '',
	ROLE: 'WEBSITE', // PORTAL, WEBSITE, DISPLAY_APP, WP_SITE, PORTAL_KIOSK, PORTAL_RESPONSIVE
	DEVICE: 'display_app',
	MAP_LOADED: false,
	KIOSK: 1,
	FLOORS: [],
	CENTER_ID: null,
	STATS: false,
	STYLE: '2D', // 2D, 3D
	DEBUG: 0,
	ACCENT_COLOR: '4EA5FF',
	STORE_DEFAULT_COLOR: 'E2E2E2',
	BIG_STORE_DEFAULT_COLOR: '3D3D3D',
	WALL_THICKNESS: 0.6,
	BOUNDARY_THICKNESS: 0.8,
	WALL_COLOR: '888888',
	BOUNDARY_COLOR: '888888',
	BASE_COLOR: '25292B',
	BUILDING_BASE_COLOR: 'DADADA',
	STORE_TEXT_COLOR: '222222',
	OVERLAY_COLOR: 'FFFFFF',
	OVERLAY_OPACITY: 0.7,
	CAMERA: null, // global camera object so it can be accessible outside this file
	CONTROLS: null, // global controls object so it can be accessible outside this file
	CAMERA_CONTROLS_STATES: null, // all devices camera and controls states 
	ORIGINAL_CAMERA_POSITION: null, // loaded and fit to canvas loaded area without any custom positions
	DEFAULT_CAMERA_POSITION: null, // custom default camera position
	DEFAULT_CONTROLS_TARGET: null, // custom default controls target
	DEFAULT_SELECTED_STORE: null,
}

// if (!isDefined(typeof MAPIT2)) window.MAPIT2 = { ...defaultVars };
// window.MAPIT2 = { ...defaultVars, ...MAPIT2 };
interface IConfig {
    [key: string]: any | undefined,
}
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

const allIndexedRetailers = {} as any;
let allIndexedMapObjects = {};
let allNonIndexedMapObjects = [];
let textLogoLayerAddedIndex = 0;
const allMapObjects = [];
const extraMapObjects = []
let activeMapObjectName = null;
const floors = [] as any[];
let floors_loaded = 0;
const BASE_URL = '/';
let node_count = 0;
const allNodesFloor = {};
const pathFinderGraph = createGraph();

function makeIndexedMapObjects(map_objs: any[]) {
    allIndexedMapObjects = {} as any;
    allNonIndexedMapObjects = map_objs;

    for (let i = 0; i < map_objs.length; i++) {
        const obj = map_objs[i];
        //@ts-ignore
        allIndexedMapObjects[obj.map_obj_name] = obj;
        for (let key in defaultMapObjValues) {
            //@ts-ignore
            const value = defaultMapObjValues[key];
            if (value != null && obj[key] == null) {
                //@ts-ignore
                allIndexedMapObjects[obj.map_obj_name][key] = value;
            }
        }
    }
}

const start_the_show = (response: any) => {
    config.FLOORS = response.floors;
    config.CAMERA_CONTROLS_STATES = response.camera_controls_states[config.DEVICE];

    for (let index in response.settings) {
        config[index] = response.settings[index];
    }


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

function getRenderOrder(mesh_type: any) {
    const renderOrders = {
        'underlay': 0,
        'overlay': 1,
        'building-base': 1,
        'base': 2,
        'store': 3,
        'big-store': 4,
        'kiosk': 5,
        'wall': 6,
        'outer-wall': 7,
        'boundary': 8,
        'amenity': 9,
        'layer-image': 10,
        'layer-text': 11,
        'route-tube': 12,
        'special-shape': 13,
    };
    //@ts-ignore
    if (renderOrders[mesh_type]) return renderOrders[mesh_type];
    return 0;
}

const useMeshFloors = (url: string): IMeshParams => {
    const [meshParams, setMeshParams] = useState<any[]>([]);
    const GeometriesAndMaterials: any[] = [];
    const result = useLoader(SVGLoader, '/data/mapit2/floor-13.svg');
    const consolePrefix = 'MAPIT2';
    // const getWallShape = (...params: any): Shape | Shape[] => {
    //     return []
    // }
	console.debug({config});

    const loadFloors = () => {
        let floor = floors[floors_loaded];
        let floor_index = floors_loaded;
        if (result && result.paths && result.paths.length) {
            const pathIds = [];
            for (let i = 0; i < result.paths.length; i++) {
                pathIds.push(result.paths[i]?.userData?.node.id);
            }
            const paths = result.paths;
            console.debug({'path.length': paths.length})
            for (var i = 0; i < paths.length; i++) {
						const {
							mesh_type,
							layer_color,
							extrude,
							z_index,
							mesh_visible,
							mesh_draw,
							mesh_transparent,
							line_thickness,
							interactiveMesh,
							path,
							layer_name,
						} = getMeshParams(
							paths[i],
							paths,
							floors,
							floor_index,
							config,
							++node_count,
                            //@ts-ignore
							allNodesFloor,
							pathFinderGraph
						);
				if (i == 0) {
					console.table([
						[{
							"path[i]": paths[i],
							paths,
							floors,
							floor_index,
							config,
							node_count,
							allNodesFloor,
							pathFinderGraph
						},
						{
							mesh_type,
							layer_color,
							extrude,
							z_index,
							mesh_visible,
							mesh_draw,
							mesh_transparent,
							line_thickness,
							interactiveMesh,
							path,
							layer_name,
						}],
					]);
				}

                if (mesh_draw) {
                    const { geometry, material } = getMaterialAndGeometry(
                        config,
                        //@ts-ignore
                        mesh_type,
                        layer_name,
                        layer_color,
                        mesh_transparent,
                        mesh_visible,
                        z_index,
                        extrude,
                        line_thickness,
                        floors,
                        floor_index,
                        allIndexedMapObjects,
                        path
                    );
					GeometriesAndMaterials.push({geometry, material});
					if (i == 0) {
						console.table([
							[{
								config,
								mesh_type,
								layer_name,
								layer_color,
								mesh_transparent,
								mesh_visible,
								z_index,
								extrude,
								line_thickness,
								floors,
								floor_index,
								allIndexedMapObjects,
								path
							},
							{
								geometry,
								material,
							}],
						]);
					}
                }
            }
            setMeshParams([...GeometriesAndMaterials])
			console.debug({GeometriesAndMaterials})
        }
    }
    useEffect(() => {
        start_the_show(data);
        loadFloors();
    }, []);

    return {meshParams};
}

export default useMeshFloors