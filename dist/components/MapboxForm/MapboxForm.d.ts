import { MapObj, MapObjToSave } from "src/mapitApiTypes";
import { IConfig, IMeshParamsTmp } from "src/types";
interface IMapboxForm {
    floorIndex: number;
    meshFloors: IMeshParamsTmp;
    config: IConfig;
    data: any;
    setData: (index: number, data: MapObj) => void;
    selectedId: string;
    centerId: string;
    onSubmit?: (data: MapObjToSave, refreshData?: () => void) => void;
}
export declare const getDefaultMapOjbValues: (centerId: string) => MapObj;
declare const MapboxForm: (params: IMapboxForm) => import("react/jsx-runtime").JSX.Element | null;
export default MapboxForm;
