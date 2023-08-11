import {useThree} from "@react-three/fiber";
import {PerspectiveCamera} from "three";

interface ICameraPropertiesProps {
    far?: number;
    near?: number;
    fov?: number;
}

export const CameraProperties = (props:ICameraPropertiesProps) => {
    const { camera } = useThree();

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

    return null;
}