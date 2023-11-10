import { MapIt2Response } from "./mapitApiTypes";
import { IJsonConfig } from "./types";
import 'bootstrap/dist/css/bootstrap.min.css';
export interface IAppProps {
    mapitData?: unknown;
    config: Partial<IJsonConfig>;
    stats?: boolean;
    onSettingsLoading?: (settings: MapIt2Response) => void;
    webApiURI?: string;
    mediaStorageURI?: string;
}
declare function MapBox({ mapitData, config, onSettingsLoading, webApiURI, mediaStorageURI }: IAppProps): import("react/jsx-runtime").JSX.Element | null;
export default MapBox;
