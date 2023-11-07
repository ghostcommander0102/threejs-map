import React from "react";
import { IJsonConfig } from "src/types";
import { MapIt2Response, MapObj } from "../../mapitApiTypes";
interface ISceneComponentProps {
    APIUri?: string;
    mapitData?: MapIt2Response;
    config: Partial<IJsonConfig>;
    selectedActiveObjectId: string;
    setSelectedActiveObjectId: React.Dispatch<React.SetStateAction<string>>;
    onMapDataUpdate?: (data: MapObj[]) => void;
    onSettingsLoading?: (settings: MapIt2Response) => void;
}
export interface IZoomData {
    direction: 'in' | 'out';
}
export type TFormMapObjData = {
    index: number;
    data: MapObj;
};
declare const SceneComponent: (params: ISceneComponentProps) => import("react/jsx-runtime").JSX.Element;
export default SceneComponent;
