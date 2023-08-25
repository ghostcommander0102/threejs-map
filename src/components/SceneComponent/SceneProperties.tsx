import {useThree} from "@react-three/fiber";
import {Color} from "three";

interface IScenePropertiesProps {
    background?: Color | string;
}

export const SceneProperties = (params:IScenePropertiesProps) => {
    const { scene } = useThree();
    if (params.background) {
        scene.background = new Color(params.background);
    }
    return null;
}