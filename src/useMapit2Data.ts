import {useEffect, useState} from "react";
import {MapIt2Response} from "./mapitApiTypes";

interface useMapIt2DataProps {
    CENTER_ID?: string;
    mapitData?: MapIt2Response;
}

/**
 * This is a hook that fetches the mapit2 data from the server by CENTER_ID. or uses the data passed in.
 * @param CENTER_ID
 * @param mapitData
 */
export function useMapit2Data({ CENTER_ID, mapitData }: useMapIt2DataProps) {
    const [data, setData] = useState<MapIt2Response|null>(null);

    if (!CENTER_ID && !mapitData) {
        console.error('useMapit2Data requires either CENTER_ID or mapitData');
    }

    useEffect(() => {
        if (mapitData) {
            setData(mapitData);
            return;
        }

        if (!CENTER_ID) {
            return;
        }
        const url = '/data/mapit2/' + CENTER_ID + '.json';
        console.log('URL', url);

        fetch(url)
            .then(response => response.json())
            .then((response: MapIt2Response) => {
                setData(response);
            });

    }, [CENTER_ID]);

    return data;
}