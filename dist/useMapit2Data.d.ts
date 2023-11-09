import { MapIt2Response } from "./mapitApiTypes";
interface useMapIt2DataProps {
    CENTER_ID: string;
    mapitData?: MapIt2Response;
    APIUri?: string;
}
/**
 * This is a hook that fetches the mapit2 data from the server by CENTER_ID. or uses the data passed in.
 * @param CENTER_ID
 * @param mapitData
 * @param APIUri
 */
export declare function useMapit2Data({ CENTER_ID, mapitData, APIUri }: useMapIt2DataProps): MapIt2Response | null;
export {};
