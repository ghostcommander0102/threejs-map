import { IJsonConfig } from "./types";
import 'bootstrap/dist/css/bootstrap.min.css';
export interface IAppProps {
    mapitData?: unknown;
    config: Partial<IJsonConfig>;
    stats?: boolean;
}
declare function MapBox({ mapitData, config }: IAppProps): import("react/jsx-runtime").JSX.Element | null;
export default MapBox;
