import type { Mesh } from "three";
import { Vector3 } from "three";
export declare function get_camera_focus_object(objs: Mesh[], fov: number, aspectRatio: number, style: string): {
    position: Vector3;
    target: Vector3;
};
