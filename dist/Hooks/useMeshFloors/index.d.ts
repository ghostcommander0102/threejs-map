import type { TRoles } from "../../types";
import { IJsonConfig, IMeshParamsTmp } from "../../types";
import { MapIt2Response } from "../../mapitApiTypes";
export declare const textLogoNamePrefix = "custom-layer-";
declare const useMeshFloors: (data: MapIt2Response | null, jsonConfig?: Partial<IJsonConfig>, role?: TRoles) => IMeshParamsTmp;
export default useMeshFloors;
