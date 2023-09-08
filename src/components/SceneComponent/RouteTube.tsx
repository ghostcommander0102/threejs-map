import React, {useEffect, useRef} from "react";
import type {Mesh} from "three";
import {easeInOutCubic} from "../../helpers/easing";
import {MeshBasicMaterial} from "three";
import {useFrame} from "@react-three/fiber";

interface IRouteTubeProps {
    mesh?: Mesh;
}

export function RouteTube({mesh}: IRouteTubeProps) {
    const animateRoute = useRef<Function | null>(null);

    useEffect(() => {
        if (!mesh) {
            return;
        }

        if (!mesh.geometry.index?.count) {
            console.log('NO ROUTE TUBE GEOMETRY INDEX COUNT');
            return;
        }

        if (!(mesh.material instanceof MeshBasicMaterial)) {
            return;
        }
        if (!mesh.material.map) {
            console.log('NO ROUTE TEXTURE');
            return;
        }

        mesh.geometry.setDrawRange(0, 0);

        const end = mesh.geometry.index.count;
        const animateTube = (
            () => {
                const length = 1000;
                const startTime = performance.now();
                return () => {
                    const progress = (performance.now() - startTime) / length;
                    const drawRangeEnd = Math.floor(easeInOutCubic(progress) * end);

                    if (progress >= 1) {
                        animateRoute.current = animateTexture;
                    }

                    mesh.geometry.setDrawRange(0, drawRangeEnd);
                }
            }
        )();

        const animateTexture = (() => {
            if (!(mesh.material instanceof MeshBasicMaterial)) {
                return null;
            }
            if (!mesh.material.map) {
                return null;
            }
            const offsetVector = mesh.material.map.offset;
            const length = 2000;
            const startTime = performance.now();
            return () => {
                const progress = (performance.now() - startTime) / length % 1;
                offsetVector.x = -easeInOutCubic(progress);
            }
        })();

        animateRoute.current = animateTube;

        return () => {
            animateRoute.current = null;
            mesh.removeFromParent();
            if (mesh.material instanceof MeshBasicMaterial) {
                mesh.material.dispose();
            }
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
        }

    }, [mesh]);

    useFrame(() => {
        if (animateRoute.current) {
            try {
                animateRoute.current();
            } catch( e: any ) {
                console.error(`ERROR ANIMATE ROUTE: ${e.message}`)
                animateRoute.current = null;
            }
        }
    });

    if (!mesh) return null;
    return <primitive object={mesh}></primitive>
}