import { allIndexedMapObjects } from "../globals";
import { DoubleSide, MeshPhongMaterial, Mesh, CanvasTexture, MeshBasicMaterial, PlaneGeometry, Vector3, BufferGeometry, Box3, Color, SphereGeometry } from "three";
import type { Object3D, Scene } from "three";
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { TextGeometry } from "three-stdlib";
import {IExtMesh} from "../types";
import {getRenderOrder} from "../Hooks/useMeshFloors/getMaterialAndGeometry";
import {hex_to_color} from "./misc";
import { IRetailer, MapObj } from "../mapitApiTypes";


export function drawTextLogoStoreOnMap(allNonIndexedMapObjects: Record<any, any>[], scene: Scene, textLogoNamePrefix: string, allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<string, IRetailer>, config: Record<any, any>, myFont: any, floors: Record<any, any>[]) {
    for (let textLogoLayerAddedIndex = 0; textLogoLayerAddedIndex < allNonIndexedMapObjects.length; textLogoLayerAddedIndex++) {
        addTextOrLogoOnStore(allNonIndexedMapObjects[textLogoLayerAddedIndex], scene, textLogoNamePrefix, allIndexedMapObjects, allIndexedRetailers, config, myFont, floors);
    }
}

function addTextOrLogoOnStore(map_obj: any, scene: Scene, textLogoNamePrefix: string, allIndexedMapObjects: Record<string, MapObj>, allIndexedRetailers: Record<any, any>, config: Record<any, any>, myFont: any, floors: Record<any, any>[]) {
    //@ts-ignore
    let mesh = scene.getObjectByProperty('object_id', map_obj.map_obj_name);
    if (mesh) {
        //@ts-ignore
        add_store_name_logo(mesh, textLogoNamePrefix, allIndexedMapObjects, allIndexedRetailers, config, myFont, floors, scene);
    }
}

function deleteMeshByObjectID(object_id: string, scene: Scene, floors: Record<any, any>) {
    if (object_id) {
        let mesh = scene.getObjectByProperty('object_id', object_id);
        if (mesh) {
            //@ts-ignore
            mesh.geometry.dispose();
            //@ts-ignore
            mesh.material.dispose();
            //@ts-ignore
            floors[mesh.floor_index].objsGroup.remove(mesh);
        }
    }
}

function getCenterPoint(mesh: Mesh) {
    var mesh_center_point = new Vector3();
    getMeshGroupBoundingBox(mesh).getCenter(mesh_center_point);
    return mesh_center_point;
}

function getMeshSize(mesh: Mesh) {
    var point = new Vector3();
    //@ts-ignore
    getMeshGroupBoundingBox(mesh).getSize(point);
    return point;
}

export function getMeshGroupBoundingBox(mesh: Mesh | Array<Mesh>) {
    if (!Array.isArray(mesh)) {
        mesh = [mesh];
    }
    const box = mesh.reduce((box, obj) => {
        if (!obj.geometry.boundingBox) {
            obj.geometry.computeBoundingBox();
        }
        //@ts-ignore
        box.union(obj.geometry.boundingBox);
        return box;
    }, new Box3());
    return box;
}

function layer_text_logo_position(mesh: Mesh, newMeshPos: Vector3, mesh_size: Vector3, newMesh: Mesh, allIndexedMapObjects: Record<any, any>) {
    const object_id = (mesh as IExtMesh).object_id;
    if (!object_id) return;
    return layer_text_logo_position_by_id(object_id, newMeshPos, mesh_size, newMesh, allIndexedMapObjects);
}
export function layer_text_logo_position_by_id(object_id: string, newMeshPos: Vector3, mesh_size: Vector3, newMesh: Mesh, allIndexedMapObjects: Record<any, any>) {
    let map_obj = allIndexedMapObjects[object_id];

    let offsetX = parseInt(map_obj.offsetX);
    let offsetY = parseInt(map_obj.offsetY);

    newMeshPos.z = -mesh_size.z;

    //@ts-ignore
    newMesh.obj_angle = parseInt(map_obj.rotate); //-180 to 180
    //@ts-ignore
    newMesh.rotateZ(newMesh.obj_angle * Math.PI / 180);

    newMesh.scale.y *= -1;

    newMeshPos.x += offsetX;
    newMeshPos.y += offsetY;

    newMesh.position.set(newMeshPos.x, newMeshPos.y, newMeshPos.z + 1);
}

/*function add_store_name_logo(mesh: Mesh, textLogoNamePrefix: string, allIndexedMapObjects: Record<any, any>, allIndexedRetailers: Record<any, any>, config: Record<any, any>, myFont: any, floors: Record<any, any>, scene: Scene) {
    //@ts-ignore
    var new_object_id = textLogoNamePrefix + mesh.object_id;
    deleteMeshByObjectID(new_object_id, scene, floors);

    var mesh_center_point = getCenterPoint(mesh);
    var mesh_size = getMeshSize(mesh);
    //@ts-ignore
    let map_obj = allIndexedMapObjects[mesh.object_id];

    if (['retail_name', 'retail_text', 'custom_text'].includes(map_obj.layer_type)) {
        let text = '';
        if (map_obj.layer_type == 'retail_name' && map_obj.retailer_id && allIndexedRetailers[map_obj.retailer_id]) {
            text = allIndexedRetailers[map_obj.retailer_id].retail_name;
        } else if (['retail_text', 'custom_text'].includes(map_obj.layer_type)) {
            text = map_obj.custom_text;
        } else {
            return false;
        }

        let text_color = config.STORE_TEXT_COLOR;
        if (map_obj.text_color != null) {
            text_color = hex_to_color(map_obj.text_color);
        }

        const material_settings = {
            color: text_color,
            transparent: true,
            side: DoubleSide,
            depthWrite: false,
            depthTest: false,
        };
        let text_material = new MeshPhongMaterial(material_settings);
        let text_geometry = new TextGeometry(text, {
            font: myFont,
            size: parseInt(map_obj.size),
            height: 0.01,
            curveSegments: 4,
        });
        text_geometry.center();

        const textMesh = new Mesh(text_geometry, text_material);
        layer_text_logo_position(mesh, mesh_center_point, mesh_size, textMesh, allIndexedMapObjects);
        //@ts-ignore
        textMesh.object_id = new_object_id;
        //@ts-ignore
        textMesh.floor_index = mesh.floor_index;
        textMesh.renderOrder = getRenderOrder('layer-text');
        //@ts-ignore
        floors[mesh.floor_index].objsGroup.add(textMesh);
        scene.add(textMesh);
        console.debug({UpdateTexts: scene});

        // Show bounding sphere

        const wireframeMaterial = new MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        textMesh.geometry.computeBoundingSphere();
        const BoundingSphereMesh = new Mesh(
            new SphereGeometry(textMesh.geometry.boundingSphere?.radius || 1, 32, 32),
            wireframeMaterial
        )
        @ts-ignore
        BoundingSphereMesh.position.copy(textMesh.geometry.boundingSphere.center || [0, 0, 0]);
        scene.add(BoundingSphereMesh);
        
    }

     else if (
        map_obj.layer_type === 'retail_logo' ||
        map_obj.layer_type === 'custom_image' ||
        (map_obj.obj_type === 'special' && map_obj.layer_type === 'kiosk' && map_obj.kiosk_id !== null) ||
        (map_obj.obj_type === 'special' && map_obj.layer_type === 'amenity' && map_obj.value !== '')
    ) {
        //@ts-ignore
        getImageLogo(allIndexedRetailers, map_obj, mesh, mesh_center_point, mesh_size);
    }
}*/
export const getImage = (map_obj: Record<string, any>, retailer?: IRetailer): HTMLImageElement | null => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        if (map_obj.obj_type == 'retailer') {
            if (retailer) {
                img.src = retailer.logo;
            } else {
                console.error('retailer not found');
                return null;
            }
        } else if (map_obj.obj_type == 'special') {
    
            let svg_image_name = map_obj.value;
            if (map_obj.layer_type == 'kiosk') svg_image_name = 'kiosk';
            if (svg_image_name) {
                let svg_color = '222222';
                if (map_obj.text_color != null) {
                    svg_color = map_obj.text_color;
                }
    
                const svg_block = document.getElementById('map-special-svg-' + svg_image_name)
                if (!svg_block) {
                    console.error('svg_block not found', svg_image_name);
                    return null;
                }
                const svg_element = svg_block.querySelector("svg");
                if (!svg_element) {
                    console.error('svg_element not found', svg_image_name);
                    return null;
                }
    
                const svgColoredParts = svg_element.querySelectorAll('[fill]');
                svgColoredParts.forEach((svgColoredPart) => {
                    svgColoredPart.setAttribute('fill', '#' + svg_color);
                })
    
                const svgData = (new XMLSerializer()).serializeToString(svg_element);
                img.src = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgData)));
            }
    
        } else {
            img.src = map_obj.custom_image;
        }

        return img;
}

export const processImage = (img: HTMLImageElement, map_obj: Record<string, any>, afterOnload: (geometry: PlaneGeometry, material: MeshBasicMaterial) => void) => {
    img.onload = function () {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");

        c.width = img.width;
        c.height = img.height;

        ctx?.drawImage(img, 0, 0);

        let texture = new CanvasTexture(c);
        texture.colorSpace = 'srgb'

        const geometry = new PlaneGeometry(map_obj.size, map_obj.size * img.height / img.width);
        const material = new MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: DoubleSide,
            depthTest: false,
            depthWrite: false,
        });
        
        afterOnload(geometry, material);
    };
}

function getImageLogo(allIndexedRetailers: Record<string, any>, map_obj: Record<string, any>, mesh: BufferGeometry,object_id: string, new_object_id: string | null, mesh_center_point: Vector3, mesh_size: Vector3, floors: any, handleAsync: (meshLogo: {storeLogo: Object3D}) => void): void {

    const img = getImage(map_obj, allIndexedRetailers[map_obj.retailer_id]);

    if (img === null) return;

    processImage(img, map_obj, (geometry, material) => {
        const logoMesh = new Mesh(geometry, material) as IExtMesh;

        // @ts-ignore
        const floor_index = mesh.floor_index;
        layer_text_logo_position_by_id(object_id, mesh_center_point, mesh_size, logoMesh, allIndexedMapObjects);
        logoMesh.object_id = new_object_id;
        logoMesh.floor_index = floor_index;
        logoMesh.renderOrder = getRenderOrder('layer-image');
        floors[floor_index]?.objsGroup.add(logoMesh);

        /*const wireframeMaterial = new MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        logoMesh.geometry.computeBoundingSphere();
        const BoundingSphereMesh = new Mesh(
            new SphereGeometry(logoMesh.geometry.boundingSphere?.radius || 1, 32, 32),
            wireframeMaterial
        )
        //@ts-ignore
        BoundingSphereMesh.position.copy(logoMesh.geometry.boundingSphere.center || [0, 0, 0]);
        
        handleAsync({storeLogo: BoundingSphereMesh});
        */
        handleAsync({storeLogo: logoMesh});
    })

}



export function get_store_name_logo_geo(geometry: BufferGeometry, object_id:string, floor_index: number, textLogoNamePrefix: string, allIndexedMapObjects: Record<any, any>, allIndexedRetailers: Record<any, any>, config: Record<any, any>, myFont: any, floors: Record<any, any>, handleAsync: (meshLogo: any) => void): {textMesh: IExtMesh} | null | false {
    const new_object_id = textLogoNamePrefix + object_id;
    // deleteMeshByObjectID(new_object_id, scene, floors);
    let result = null;

    if (!geometry.boundingBox) {
        geometry.computeBoundingBox();
    }
    if (!geometry.boundingBox) {
        return null;
    }

    const boundingBox = geometry.boundingBox;

    const mesh_center_point = new Vector3();
    boundingBox.getCenter(mesh_center_point);

    const mesh_size = new Vector3();
    boundingBox.getSize(mesh_size);

    //@ts-ignore
    const map_obj = allIndexedMapObjects[object_id];

    if (['retail_name', 'retail_text', 'custom_text'].includes(map_obj.layer_type)) {
        let text = '';
        if (map_obj.layer_type == 'retail_name' && map_obj.retailer_id && allIndexedRetailers[map_obj.retailer_id]) {
            text = allIndexedRetailers[map_obj.retailer_id].retail_name;
        } else if (['retail_text', 'custom_text'].includes(map_obj.layer_type)) {
            text = map_obj.custom_text;
        } else {
            return false;
        }

        let text_color = config.STORE_TEXT_COLOR;
        if (map_obj.text_color != null) {
            text_color = hex_to_color(map_obj.text_color);
        }

        const material_settings = {
            color: text_color,
            transparent: true,
            side: DoubleSide,
            depthWrite: false,
            depthTest: false,
        };
        let text_material = new MeshPhongMaterial(material_settings);
        let text_geometry = new TextGeometry(text, {
            font: myFont,
            size: parseInt(map_obj.size),
            height: 0.01,
            curveSegments: 4,
        });
        text_geometry.center();

        const textMesh = new Mesh(text_geometry, text_material) as IExtMesh;
        textMesh.userData.font = myFont;
        layer_text_logo_position_by_id(object_id, mesh_center_point, mesh_size, textMesh, allIndexedMapObjects);
        textMesh.object_id = new_object_id;
        textMesh.floor_index = floor_index;
        textMesh.renderOrder = getRenderOrder('layer-text');
        if (map_obj.layer_type === 'retail_name') {
            textMesh.userData.retail_name = text;
        }

        floors[floor_index].objsGroup.add(textMesh);

        //scene.add(textMesh);
        //console.debug({UpdateTexts: scene});

        // Show bounding sphere

        /*const wireframeMaterial = new MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        textMesh.geometry.computeBoundingSphere();
        const BoundingSphereMesh = new Mesh(
            new SphereGeometry(textMesh.geometry.boundingSphere?.radius || 1, 32, 32),
            wireframeMaterial
        )
        @ts-ignore
        BoundingSphereMesh.position.copy(textMesh.geometry.boundingSphere.center || [0, 0, 0]);
        scene.add(BoundingSphereMesh);
        */
        result = { textMesh };
    }

    else if (
       map_obj.layer_type == 'retail_logo' ||
       map_obj.layer_type == 'custom_image' ||
       (map_obj.obj_type == 'special' && map_obj.layer_type == 'kiosk' && map_obj.kiosk_id != null) ||
       (map_obj.obj_type == 'special' && map_obj.layer_type == 'amenity' && map_obj.value != '')
   ) {
        getImageLogo(allIndexedRetailers, map_obj, geometry, object_id, new_object_id, mesh_center_point, mesh_size, floors, handleAsync);


   }
   return result;
}