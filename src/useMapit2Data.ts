import {useEffect, useState} from "react";
import {IRetailer, MapIt2Response} from "./mapitApiTypes";
import demoData from './demo/data.json';

interface useMapIt2DataProps {
    CENTER_ID: string;
    mapitData?: MapIt2Response;
    webApiURI?: string;
}

/**
 * This is a hook that fetches the mapit2 data from the server by CENTER_ID. or uses the data passed in.
 * @param CENTER_ID
 * @param mapitData
 */
export function useMapit2Data({ CENTER_ID, mapitData, webApiURI }: useMapIt2DataProps) {
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

        let apiURI = webApiURI || null;

        if (apiURI) {
            const r = /\/$/;
            apiURI = apiURI.replace(r, '');
            const retailersApiUri = `${apiURI}/v1/retailers/?limit=1000&page=1`;
            const mapObjsApiUri = `${apiURI}/v1/mapit2/data/`;
            const floorsApiUri = `${apiURI}/v1/mapit2/floors/?limit=1000&offset=0`;

            const retailersPromise = fetch(retailersApiUri, {
                headers: {
                    center_id: CENTER_ID,
                }
            }).then(repsonse => repsonse.json())

            const mapObjsPromise = fetch(mapObjsApiUri, {
                headers: {
                    center_id: CENTER_ID,
                }
            }).then(repsonse => repsonse.json())

            const floorsPromise = fetch(floorsApiUri, {
                headers: {
                    center_id: CENTER_ID,
                }
            }).then(repsonse => repsonse.json())

            Promise.all<Array<any>>([
                retailersPromise,
                mapObjsPromise,
                floorsPromise,
            ]).then(data => {
                if (data) {
                    const responseData: Partial<MapIt2Response> = {};
                    responseData.retailers = data[0].items.map((item: any): IRetailer => ({
                        id: item.id,
                        retail_name: item.name,
                        slug: item.slug,
                        location: item.location,
                        retailer_phone: '',
                        retailer_description: '',
                        logo: item.media.url,
                        map_obj_name: '',
                    }));
                    responseData.map_objs = [...data[1].items];
                    responseData.floors = [...data[2].items];
                    responseData.camera_controls_states = {...demoData.camera_controls_states};
                    responseData.settings = {
                        ...demoData.settings,
                        KIOSK_SIZE: "1",
                    }
                    responseData.kiosks = [];
                    responseData.amenities = {...demoData.amenities};

                    setData({...responseData as MapIt2Response})
                }
            })
        }

    }, [CENTER_ID, mapitData]);

    return data;
}