import { MapObj } from "src/mapitApiTypes";
import { IConfig, IMeshParamsTmp } from "src/types";
interface IMapboxForm {
    floorIndex: number;
    meshFloors: IMeshParamsTmp;
    config: IConfig;
    data: any;
    setData: (index: number, data: MapObj) => void;
    selectedId: string;
    centerId: string;
}
declare const MapboxForm: (params: IMapboxForm) => import("react/jsx-runtime").JSX.Element;
export default MapboxForm;
