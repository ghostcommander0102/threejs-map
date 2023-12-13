import type {Mesh} from "three";
import {Box3, Vector3} from "three";

export function get_camera_focus_object(objs:Mesh[], fov:number, aspectRatio: number, style: string) {
    // config.STYLE
    // config.CAMERA.fov

    if (!Array.isArray(objs)) {
        objs = [objs];
    }
    if (!objs.length) {
        console.warn('get_camera_focus_object: no objects passed');
        return { position: new Vector3(), target: new Vector3() };
    }

    const objsBoundingBox = objs.reduce((box, obj) => {
        if (!obj.geometry.boundingBox) {
            obj.geometry.computeBoundingBox();
        }
        if (obj.geometry.boundingBox) {
            box.union(obj.geometry.boundingBox);
        }
        return box;
    }, new Box3());

    const obj_size = new Vector3();
    objsBoundingBox.getSize(obj_size);

    const center = new Vector3();
    objsBoundingBox.getCenter(center);

    objs[0].localToWorld(center);

    // var max_length = (obj_size.x > obj_size.y && aspectRatio() < 1 ? obj_size.x : obj_size.y) / 2;
    // var padding = max_length * 0.2;
    // if (padding > 50) padding = 50;
    // max_length += padding;
    // var new_y = max_length / Math.tan(camera.fov * Math.PI / 360);

    let tanFOV = Math.tan(Math.PI * fov / 360);
    let padding = 1.1;
    let new_width = (obj_size.x * padding) / 2 / (tanFOV * aspectRatio);
    let new_height = (obj_size.y * padding) / 2 / tanFOV;
    let new_y = Math.max(new_width, new_height);
    let new_z = getCameraTiltPosition(new_y, style);

    const target = new Vector3(center.x, 0, center.z);
    const position = new Vector3(center.x, new_y, center.z + new_z);

    // createjs.Ticker.framerate = 60;
    // createjs.Tween.get(config.CONTROLS.target)
    //     .to({ x: center.x, z: center.z }, 400);
    // createjs.Tween.get(config.CAMERA.position)
    //     .to({ x: center.x, y: new_y, z: center.z + new_z }, 400);

    return {position, target};
}

function getCameraTiltPosition(y:number, style:string): number {
    let angle = 60;
    if (style == '2D') angle = 89.9;
    return y / Math.tan(angle * Math.PI / 180);
}