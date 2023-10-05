import {useThree} from "@react-three/fiber";
import { ICameraPropertiesProps } from "src/types";
import {PerspectiveCamera} from "three";

export const CameraProperties = (props:ICameraPropertiesProps) => {
    const { camera } = useThree();

    const cameraProjectionNeedsUpdate = props.far || props.near || props.fov;
    if (props.far) {
        camera.far = props.far;
    }
    if (props.near) {
        camera.near = props.near;
    }

    if (camera instanceof PerspectiveCamera) {
        if (props.fov) {
            camera.fov = props.fov;
        }
    }

    if (cameraProjectionNeedsUpdate) {
        camera.updateProjectionMatrix();
    }

    return null;
}