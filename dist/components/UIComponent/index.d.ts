import { IAmenitiesInteractiveList, IFloorSelectorProps, TRoles } from "src/types";
import { MouseEventHandler } from "react";
declare const UIComponent: ({ floors, accentColor, selectedFloorIndex, handleFloorChange, amenitiesList, zoomIn, zoomOut, reset, clearRoute, handleAmenityClick, role, }: IFloorSelectorProps & {
    amenitiesList: IAmenitiesInteractiveList[];
    zoomIn?: MouseEventHandler<HTMLDivElement> | undefined;
    zoomOut?: MouseEventHandler<HTMLDivElement> | undefined;
    reset?: (() => void) | undefined;
    clearRoute?: MouseEventHandler<HTMLDivElement> | undefined;
    handleAmenityClick: (type: string) => void;
    role?: TRoles | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export default UIComponent;
