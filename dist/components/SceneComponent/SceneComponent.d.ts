import React from "react";
import { IJsonConfig, TMapMode } from "types";
import { MapIt2Response, MapObj } from "../../mapitApiTypes";
interface ISceneComponentProps {
    CENTER_ID?: string;
    mapitData?: MapIt2Response;
    config?: Partial<IJsonConfig>;
    stats?: boolean;
    selectedActiveObjectId: string;
    setSelectedActiveObjectId: React.Dispatch<React.SetStateAction<string>>;
    mode?: TMapMode;
    onMapDataUpdate?: (data: MapObj[]) => void;
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
