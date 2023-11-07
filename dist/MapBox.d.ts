import { MapIt2Response } from "./mapitApiTypes";
import { IJsonConfig } from "./types";
import 'bootstrap/dist/css/bootstrap.min.css';
export interface IAppProps {
    mapitData?: unknown;
    config: Partial<IJsonConfig>;
    stats?: boolean;
    onSettingsLoading?: (settings: MapIt2Response) => void;
    APIUri?: string;
}
declare function MapBox({ mapitData, config, onSettingsLoading, APIUri }: IAppProps): import("react/jsx-runtime").JSX.Element | null;
export default MapBox;
