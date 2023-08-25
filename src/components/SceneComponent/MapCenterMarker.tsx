import React, {useEffect} from "react";

export const MapCenterMarker = () => {
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
        <div className="mapCenterMarker"></div>
        <div className="kioskMarker" ref={kioskElementRef}></div>
    </>
}