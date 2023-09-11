import type { TMapMode } from "../../types";
import { IJsonConfig, IMeshParamsTmp } from "../../types";
import { MapIt2Response } from "../../mapitApiTypes";
export declare const textLogoNamePrefix = "custom-layer-";
declare const useMeshFloors: (data: MapIt2Response | null, jsonConfig?: IJsonConfig, mode?: TMapMode) => IMeshParamsTmp;
export default useMeshFloors;
