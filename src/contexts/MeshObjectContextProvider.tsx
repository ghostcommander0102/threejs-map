import { createContext, useContext, useState } from "react"
import { Object3D } from "three";
import { IExtMesh } from "src/types";


type TMeshObjectContext = {
    MeshObject: IExtMesh[] | null;
    SetMeshObject: React.Dispatch<React.SetStateAction<IExtMesh[] | null>>;
}

const MeshObjectContext = createContext<TMeshObjectContext | null>(null);

export default function MeshObjectContextProvider({children}: {children: React.ReactNode}) {
    const [MeshObject, SetMeshObject] = useState<IExtMesh[] | null>(null);

    return (
        <MeshObjectContext.Provider
            value={{
                MeshObject,
                SetMeshObject,
            }}
        >
            {children}
        </MeshObjectContext.Provider>
    )
}

export function useMeshObjectContext() {
    const context = useContext(MeshObjectContext);

    if (context === undefined) {
        throw new Error("useMeshObjectContext must be used within MeshObjectContextProvider");
    }

    return context;
}
