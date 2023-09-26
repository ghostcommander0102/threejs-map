import {BackSide, Color, DoubleSide, ExtrudeGeometry, Mesh, MeshLambertMaterial, ShapeGeometry, Vector3} from "three";
import {getWallShape} from "./getWallShape";
// import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";
import { mergeBufferGeometries as mergeGeometries } from "three-stdlib";
import {allMapObjects} from "../../globals";
import {IConfig, IExtMesh, IMeshValues, TMapMode} from "../../types";
import {hex_to_color} from "../../helpers/misc";

import {IRetailer, MapObj} from "../../mapitApiTypes";


const renderOrders = {
    'route-path': 0,
    'escalator': 0,
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

export type MeshType = keyof typeof renderOrders | null;

export function getRenderOrder(mesh_type: MeshType): number {
    if (mesh_type !== undefined && mesh_type !== null && renderOrders[mesh_type] !== undefined) {
        return renderOrders[mesh_type];
    }
    // console.warn(`Unknown mesh type: ${mesh_type}`)
    return 0;
}

export const getMaterial = (
    config: IConfig,
    mesh_type: MeshType,
    layer_name: string,
    layer_color: Color | string,
    mesh_transparent: boolean,
    allIndexedMapObjects: Record<string, MapObj>,
) => {
    const material_settings = {
        color: layer_color instanceof Color ? layer_color : hex_to_color(layer_color),
        side: DoubleSide,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        opacity: 1,
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
    if (mesh_type && ['store', 'big-store', 'kiosk'].includes(mesh_type) && config.ROLE != 'PORTAL' && allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].transparent == 1) {
        material_settings.opacity = 0;
    }
    var material = new MeshLambertMaterial(material_settings);
    if (mesh_type && ['store', 'big-store', 'kiosk', 'amenity'].includes(mesh_type)) {
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
        material.transparent = true;
    }

    material.transparent = material.opacity !== 1;

    return material;
}

export const getGeometry = (
    config: IConfig,
    mesh_type: MeshType,
    layer_name: string,
    extrude: number,
    line_thickness: number,
    path: any,
) => {
    const consolePrefix = 'MaterialAndGeometry';

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
    if (mesh_type && extrude_meshes.includes(mesh_type)) {
        geometry = new ExtrudeGeometry(shapes, {
            depth: -extrude,
            bevelEnabled: false,
        });
    } else if (mesh_type && wall_meshes.includes(mesh_type)) {
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
                        depth: -extrude,
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
        try {
            //@ts-ignore
            if (geometry.attributes.position.count == 0) {
                console.warn(consolePrefix + 'Unneccessary map shape "%s"', layer_name, path.userData.node);
            }
        } catch (e: any) {
            console.error(e.message);
        }
    }

    return geometry;
}

export const getMaterialAndGeometry = (config: IConfig, mesh_type: MeshType, layer_name: string, layer_color: Color | string, mesh_transparent: boolean, mesh_visible: boolean, z_index: number, extrude: number, line_thickness: number, floors: any, floor_index: number, allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<string, IRetailer>, path: any, mode?: TMapMode): IMeshValues => {
    
    const material = getMaterial(
        config,
        mesh_type,
        layer_name,
        layer_color,
        mesh_transparent,
        allIndexedMapObjects
    );

    const geometry = getGeometry(
        config,
        mesh_type,
        layer_name,
        extrude,
        line_thickness,
        path
    );

    const mesh = new Mesh(geometry, material) as IExtMesh;
    mesh.object_id = layer_name;
    mesh.mesh_type = mesh_type;
    mesh.floor_index = floor_index;
    mesh.visible = mesh_visible;
    mesh.position.z = z_index;
    let storeName = '';
    if (['retail_name', 'retail_text', 'custom_text'].includes(allIndexedMapObjects[layer_name]?.layer_type)) {
        if (allIndexedMapObjects[layer_name].layer_type && allIndexedMapObjects[layer_name].layer_type == 'retail_name' && allIndexedMapObjects[layer_name].retailer_id && allIndexedRetailers[allIndexedMapObjects[layer_name].retailer_id]) {
            storeName = allIndexedRetailers[allIndexedMapObjects[layer_name].retailer_id].retail_name;
        } else if (['retail_text', 'custom_text'].includes(allIndexedMapObjects[layer_name].layer_type)) {
            storeName = allIndexedMapObjects[layer_name].custom_text;
        }
    }
    mesh.userData.storeName = storeName;
    if (config.STYLE == '2D') {
        mesh.renderOrder = getRenderOrder(mesh_type);
        if (layer_name && layer_name.includes('underlay')) {
            mesh.renderOrder = getRenderOrder('underlay');
        }
    }

    floors[floor_index].objsGroup.add(mesh);

    if (mesh_type == 'escalator') {
        floors[floor_index].escalatorsNodes[layer_name] = null;
        floors[floor_index].escalatorsObjs.push(mesh);
        mesh.escalator_id = floor_index + '-' + layer_name;
    }

    if (mesh_type && ['store', 'big-store', 'kiosk', 'amenity'].includes(mesh_type)) {
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
            (config.ROLE != 'PORTAL' && config.ROLE != 'PORTAL_KIOSK' && allIndexedMapObjects[layer_name] && allIndexedMapObjects[layer_name].layer_type == 'amenity' && allIndexedMapObjects[layer_name].value != '') ||
            (mode === 'edit' && (allIndexedMapObjects[layer_name]) && (allIndexedMapObjects[layer_name].obj_type === 'special' || allIndexedMapObjects[layer_name].obj_type === 'custom')) ||
            (mode === 'edit' && ['store', 'kiosk', 'amenity'].includes(mesh.mesh_type?? ''))
        ) {
            // if (interactiveMesh) {
            floors[floor_index].interactiveObjs.push(mesh);
            // }
        }
    }

    // if (['store', 'big-store'].includes(mesh_type as string)) {
    //     console.debug({allIndexedMapObjects: allIndexedMapObjects[layer_name]});
    // }

    return {
        mesh,
        geometry,
        material,
        object_id: layer_name,
        mesh_type,
        floor_index,
        visible: mesh_visible,
        renderOrder: mesh.renderOrder,
    }
    // });

}