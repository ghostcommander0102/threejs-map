import { IJsonConfig, TMapMode } from "./types";
import 'bootstrap/dist/css/bootstrap.min.css';
export interface IAppProps {
    CENTER_ID?: string;
    mapitData?: unknown;
    config?: Partial<IJsonConfig>;
    stats?: boolean;
    mode: TMapMode;
}
declare function MapBox({ CENTER_ID, mapitData, config, stats, mode }: IAppProps): import("react/jsx-runtime").JSX.Element | null;
export default MapBox;
