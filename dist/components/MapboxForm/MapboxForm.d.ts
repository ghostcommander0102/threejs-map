interface IMapboxForm {
    data: any;
    setData: (data: unknown) => void;
    selectedId: string;
    centerId: string;
}
declare const MapboxForm: (params: IMapboxForm) => import("react/jsx-runtime").JSX.Element;
export default MapboxForm;
