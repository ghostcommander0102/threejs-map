import React, {useEffect} from "react";
import styles from '../../MapBox.module.css';

export const MapCenterMarker = ({size, koef}: {size: number, koef: number}) => {
    const kioskElementRef = React.useRef<HTMLDivElement>(null);

    // todo figure out better way
    useEffect(() => {
        if (!kioskElementRef.current) return;
        const kioskElement = kioskElementRef.current;
        const svgOrigin = document.querySelector('#map-special-svg-kiosk svg');
        let svgClone:Node;
        if (svgOrigin) {
            svgClone = svgOrigin.cloneNode(true);
            kioskElement.appendChild(svgClone);
        }

        return () => {
            if (svgClone) {
                kioskElement.removeChild(svgClone);
            }
        }
    }, []);

    return <>
        <div className={styles['mapCenterMarker']}></div>
        <div className={styles['kioskMarker']} ref={kioskElementRef} style={{width: koef*10+size, height: koef*10+size*2}}></div>
    </>
}