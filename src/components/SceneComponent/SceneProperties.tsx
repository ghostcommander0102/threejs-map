import {useThree} from "@react-three/fiber";
import {Color} from "three";

interface IScenePropertiesProps {
    background?: string;
}

export const SceneProperties = (params:IScenePropertiesProps) => {
    const { scene } = useThree();
    if (params.background) {
        scene.background = new Color(params.background);
    }
    return null;
}