import { IAmenitiesInteractiveList, IFloorSelectorProps, TMapMode } from "types";
import { MouseEventHandler } from "react";
declare const UIComponent: ({ floors, accentColor, selectedFloorIndex, handleFloorChange, amenitiesList, zoomIn, zoomOut, reset, clearRoute, handleAmenityClick, mode, }: IFloorSelectorProps & {
    amenitiesList: IAmenitiesInteractiveList[];
    zoomIn?: MouseEventHandler<HTMLDivElement> | undefined;
    zoomOut?: MouseEventHandler<HTMLDivElement> | undefined;
    reset?: (() => void) | undefined;
    clearRoute?: MouseEventHandler<HTMLDivElement> | undefined;
    handleAmenityClick: (type: string) => void;
    mode?: TMapMode | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export default UIComponent;
