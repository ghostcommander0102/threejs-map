/// <reference types="react" />
import { IExtMesh } from "types";
type TMeshObjectContext = {
    MeshObject: IExtMesh[] | null;
    SetMeshObject: React.Dispatch<React.SetStateAction<IExtMesh[] | null>>;
};
export default function MeshObjectContextProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useMeshObjectContext(): TMeshObjectContext | null;
export {};
