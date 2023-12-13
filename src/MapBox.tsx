import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import styles from './MapBox.module.css';
import SceneComponent from './components/SceneComponent/SceneComponent';
import {isMapIt2Response, MapIt2Response, MapObj, MapObjToSave} from "./mapitApiTypes";
import {IJsonConfig, TMapMode, TMapSettingsProps, TRoles} from "./types";
import MeshObjectContextProvider from 'src/contexts/MeshObjectContextProvider';
import 'bootstrap/dist/css/bootstrap.min.css';

export type MapBoxRefFs = {
  refreshData: () => void,
}
export interface IAppProps {
    mapitData?: unknown;
    config: Partial<IJsonConfig>;
    stats?: boolean;
    onSettingsLoading?: (settings: MapIt2Response) => void;
    webApiURI?: string;
    mediaStorageURI?: string;
    onSubmit?: (data: MapObjToSave, refreshData?: () => void) => void;
    refObj?: MutableRefObject<MapBoxRefFs | null> | undefined,
}


function MapBox({ mapitData, config, onSettingsLoading, webApiURI, mediaStorageURI, onSubmit, refObj }: IAppProps) {
  const [selectedActiveObjectId, setSelectedActiveObjectId] = useState<string>('');
  const [mapData, setMapData] = useState<any>(undefined);

  useEffect(() => {
    setMapData(mapitData);
  }, [mapitData])

  if (!mapitData && !config.CENTER_ID) {
    console.error('Please provide either mapitData or CENTER_ID');
    return null;
  }
  if (!config.CENTER_ID && !isMapIt2Response(mapitData)) {
    console.error('mapitData is not a valid MapIt2Response');
    return null;
  }

  const handleOnSubmit = (data: MapObjToSave, refreshData?: () => void) => {
    if (onSubmit) {
      onSubmit(data, refreshData);
    }
  }

  return (
    <MeshObjectContextProvider>
      <div className={`${styles['mapbox-component']} ${config.ROLE !== 'PORTAL'? styles.view : ''}`}>
        <SceneComponent
          ref={refObj}
          setSelectedActiveObjectId={setSelectedActiveObjectId}
          selectedActiveObjectId={selectedActiveObjectId}
          mapitData={mapData}
          config={config}
          onSettingsLoading={onSettingsLoading}
          webApiURI={webApiURI}
          mediaStorageURI={mediaStorageURI}
          onSubmit={handleOnSubmit}
        />
        <div className={styles.hide}>
          <div id="map-special-svg-kiosk">
            <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 443.83 787.21">
              <path d="M451,587.7V8.14H7.14V589.5H111.43V730.89H71.27L38.59,763.58v31.78H416.36V764.93l-34.05-34H345.78V587.7ZM396.91,71.23v452.7H59.85V71.23Z" transform="translate(-7.14 -8.14)" fill="#222222" />
            </svg>
          </div>
          <div id="map-special-svg-atm">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248.08 247.92">
              <path d="M122,257.27c-5.39-1-10.81-1.79-16.17-2.92C46.21,241.73,4.83,187.22,8.2,125.78,11.48,65.91,58.61,16.49,118.57,10.07a123.9,123.9,0,0,1,136.17,105.3c9.72,65.14-34,126.76-99,139.57-4.56.9-9.16,1.56-13.74,2.33Zm119.67-124c0-60.41-49.38-109.74-109.76-109.66S22.16,73.17,22.33,133.47A109.8,109.8,0,0,0,131.87,242.79C192.39,242.87,241.67,193.71,241.67,133.26Z" transform="translate(-8.01 -9.35)" fill="#222" />
              <path d="M142.74,209.12v17.52h-20V209.15c-16.35-2.42-30.49-8.31-39.37-22.87-5.29-8.67-7.81-18.17-8.61-28.56H104c.63,12.29,6,21.26,18.19,26a31.6,31.6,0,0,0,.46-3.66c0-11.83-.09-23.66.1-35.49,0-3-.93-4.26-3.86-5.14-6.36-1.9-12.81-3.81-18.77-6.68-24.22-11.66-29.61-43.54-10.9-63.07,7.4-7.74,16.65-12,27-14.3,1.94-.43,3.89-.79,6.33-1.28V38.43H142.7c0,4.09.19,8-.06,12-.21,3.14,1,4.26,4,4.9C161.3,58.39,173.8,65,180.47,79.1c2.7,5.7,3.82,12.15,5.84,18.89h-29c-2.52-5-4.56-9.87-7.34-14.25-1.3-2-4-3.16-6.85-5.24-.21,2.37-.43,3.76-.43,5.15,0,9,.2,18-.12,27-.15,4,1,5.68,5,6.81a120.71,120.71,0,0,1,19.6,7.27c29.52,14.08,31.09,54.34,5.8,72.94a60.33,60.33,0,0,1-25.11,10.52Zm.17-25.19c12.19-2.62,18.79-10.58,18-21.25-.58-8.26-7.84-14.53-18-15.4Zm-20.7-73.36V79.24c-8.71,1.32-14.1,7.27-14.38,15.45C107.55,103.15,112,108.2,122.21,110.57Z" transform="translate(-8.01 -9.35)" fill="#222" />
            </svg>
          </div>
          <div id="map-special-svg-management">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 772.14 772.14">
              <path d="M12.61,738.09V58.45C28.35,20.11,40.21,12.29,82.7,12.29q319.74,0,639.46,0c41.63,0,62.59,21,62.59,62.6q0,319.73,0,639.46c0,42.33-7.5,53.72-46.15,70.07H59C35.27,777.22,19.94,761.66,12.61,738.09ZM400.34,61.77c-107.07,0-214.15.2-321.22-.26-12.89-.06-16.48,3.72-16.45,16.58q.55,319.68,0,639.36c0,12.41,2.94,17,16.27,16.93q319.68-.57,639.36,0c13.72,0,17.24-4.07,17.22-17.54q-.62-318.92.09-637.82c0-15.33-5.44-17.56-18.71-17.5C611.41,62,505.88,61.77,400.34,61.77Z" transform="translate(-12.61 -12.29)" fill="#222" />
              <path d="M262.69,306.22V651.6H192.15V166.28c30.74,0,61.46-.43,92.13.58,3.59.11,8.35,7.62,10.16,12.58Q342.59,311.11,390.09,443c1.68,4.63,3.75,9.13,6.67,16.17,25-70.19,49-137.75,73-205.3,9.13-25.64,18-51.37,27.69-76.8,1.63-4.29,6.68-10.23,10.3-10.34,28.14-.86,56.31-.47,85.28-.47V651.68h-70.4V306.9l-3.4-.66c-40.49,114.34-81,228.68-122.82,346.81L266,305.68Z" transform="translate(-12.61 -12.29)" fill="#222" />
            </svg>
          </div>
          <div id="map-special-svg-playarea">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 670 772.73">
              <path d="M148.12,16l38.67,19.35c-1.08,3.94-1,5.26-1.61,5.69C146.81,68.47,142,105.72,153.25,148.13c4,15,10.9,27.7,8.38,46.15-3.85,28.24,2.4,58.08,5.93,87,7.47,61.24,15.95,122.37,24.06,183.54.22,1.7,1,3.32,5.06,4.77,0-6.85-.19-13.72,0-20.57q3.48-108,7-216.07c.49-15.79-.36-28.92-15.76-41.44-31.82-25.87-40.12-82.17-21.82-117.88,12.56-24.5,42.67-39.33,70-34.48,29.31,5.19,52.71,28.25,56.62,55.79,6.76,47.64-31.32,101.11-82.12,110.92-3.34,93-6.71,186.81-10.08,280.64l2,.51c8.65-25.2,17.71-50.26,25.86-75.62,12.44-38.67,20.78-45.73,62-45.4,25.4.2,51.66-5.14,75.71,8.28h0c10,20.57,21.3,40.63,29.58,61.87,8.15,20.92,13.22,43,22.11,64.6,0-22.62-1-45.31.36-67.85.9-14.63,2.86-30.09,8.56-43.36,15.8-36.77,49.23-48,85.26-51.6,53.64-5.4,91.8,16.8,118.08,67.53,4.33-48.86,8.76-95.83,12.54-142.85,1.47-18.36,2-36.83,1.8-55.24,0-4.14-3.6-9.86-7.24-12.11-38.47-23.86-61.06-77.9-50.47-122.24,7.85-32.89,45-57.77,80.43-53.93,34.42,3.72,64.49,35.87,65.08,69.56.87,50.08-32.63,99.45-78.55,111.54-8,98.49-16.21,198.19-24,297.92-1.24,15.88-.18,31.94-.77,47.89-.61,16.7-9.35,26.37-22.36,25.79-12.72-.56-20.17-9.65-20.3-25.88-.23-31.43,0-62.86-.16-94.28,0-5.15-.88-10.3-1.35-15.45l-4.94,0c-.44,5.2-1.27,10.39-1.28,15.59q-.09,149.16,0,298.31c0,6.16.36,12.61-1.28,18.41-3.27,11.61-9.78,20.13-23.7,20.13-13.76,0-20.67-8.24-24.18-19.78-1.75-5.74-1.29-12.24-1.29-18.4,0-55.13.07-110.26,0-165.39,0-5.75-1.1-11.49-1.68-17.24l-4.78-.27c-.79,5.38-2.25,10.76-2.26,16.14-.14,55.13,0,110.26,0,165.39,0,5.65.47,11.51-.8,16.92-3.05,13-9.77,22.67-25,22.54-12.68-.11-22.84-8.63-24.07-23.15-1.39-16.37-.93-32.92-.93-49.4q0-132.15.09-264.3c0-4.84-.76-9.69-1.16-14.53l-4.29-.33c-.77,4.87-2.16,9.73-2.2,14.6-.21,31.95.12,63.89-.24,95.83-.22,20.06-10.43,27-30.12,22.18-3.33-.82-7.64.15-10.89,1.63C405.73,577.45,398.51,575.6,393,561c-6.64-17.8-11.54-36.25-17.17-54.42-4.77-15.39-9.5-30.79-16.31-45.56,4.61,66.85,34.83,126.95,50.18,192.46H356c-.4,6.2-1,11.09-1,16-.07,30.92.13,61.83,0,92.74-.09,17.27-7.59,26.31-21.15,26.44s-21.28-8.67-21.46-26.19c-.33-30.39.05-60.8-.24-91.19-.05-5.32-1.93-10.62-3-15.92l-5.05.34c-.55,5.2-1.55,10.39-1.57,15.59-.14,27.31,0,54.62,0,81.92,0,4.12.27,8.27-.08,12.36-1.21,14.52-9.54,23.29-21.64,23.09s-20.85-9.05-21.09-23.66c-.51-30.9-.11-61.82-.09-92.74,0-5.55,0-11.1,0-18.3h-54.7c15.54-65.55,45.77-125.27,48.86-192.3a75.07,75.07,0,0,0-3.63,8.3c-9,29.51-17.65,59.11-26.79,88.56C220,569.27,213.22,577.24,200.64,574c-13.58-3.53-12.34-14-12.36-25.82-.06-33.23-.45-66.69-4.26-99.64-8.85-76.66-19.93-153.07-29.78-229.61-2.15-16.73-7.5-28.15-25.78-34.52-36.3-12.65-68.26-62.14-66.11-99.94,1.71-30,18.74-50.32,45.57-62.84,4.11-1.92,8.25-3.76,12.38-5.64Z" transform="translate(-62.25 -15.96)" fill="#222" />
              <path d="M366.14,374.32c-10.69-26.47-3.48-53.71-3.51-80.64,0-5.71-.5-11.43-.77-17.14l-6.36-.05c0,7.36-.44,14.76.07,22.08,2.61,37.58-28.14,62.52-64,51.69-22.85-6.91-35.81-29.12-32.36-54.56.85-6.27.13-12.75.13-19.13l-7-.39c-.36,6.46-1.24,12.95-1,19.38.8,18.49,2.46,36.94,2.93,55.43.15,6-2.36,12-3.42,16.92-8-28.07-16.1-55.61-23.69-83.28-5.76-21-.8-30.34,20.52-31.34,21.48-1,43.14,2.79,64.75,3.44,7.73.23,15.57-3.86,23.32-3.71,15.13.3,30.72.3,45.19,4,11.92,3.08,10.3,15.27,7.59,25-4.42,15.82-10.3,31.26-14.23,47.19-3.64,14.79-5.54,30-8.21,45.07Z" transform="translate(-62.25 -15.96)" fill="#222" />
              <path d="M573.81,274.55c-.08,26.89-23.52,50.26-50.32,50.17-27.05-.08-50.08-23.2-50.09-50.26,0-27.7,22.11-49.49,50.18-49.45S573.9,247,573.81,274.55Z" transform="translate(-62.25 -15.96)" fill="#222" />
            </svg>
          </div>
          <div id="map-special-svg-restroom">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 732.38 614.5">
              <path d="M129.05,159.85a55.6,55.6,0,1,1,55.6,55.6,55.69,55.69,0,0,1-55.6-55.6m55.7,69.6h-1.5a133.5,133.5,0,0,0-132,134.6v58.6a27,27,0,0,0,54,0v-58.9a78.92,78.92,0,0,1,18.9-52.2v366a27,27,0,1,0,53.9,0V472.65h13.2v204.9a27,27,0,0,0,54,0V311.35a78.75,78.75,0,0,1,18.9,50.4v60.9a27,27,0,0,0,54,0v-61.2c-.8-73.1-60.5-132-133.4-132m596.5,182.1c-3.7-8-7.3-16.8-11.1-26.2-25.9-62.1-64.9-155.9-157.8-155.9s-132,93.9-157.7,156c-3.9,9.3-7.6,18.1-11.2,26.1a27,27,0,0,0,13.5,35.7,26.17,26.17,0,0,0,11.1,2.4,26.93,26.93,0,0,0,24.6-15.9c3.9-8.5,7.7-17.8,11.8-27.6,19.4-46.8,37.7-86.1,63.7-106.9l-70.4,174.4c-10,24.6,3.7,44.8,30.2,44.8h23.8v159.1a27,27,0,0,0,54,0V518.45h13.1v159.1a27,27,0,0,0,54,0V518.45h23.9c26.6,0,40.2-20.2,30.3-44.8l-70.4-174.4c26,20.7,44.2,60,63.7,106.8,4,9.8,8,19.2,11.8,27.7a26.93,26.93,0,0,0,24.6,15.9,27.41,27.41,0,0,0,11.1-2.4,27.12,27.12,0,0,0,13.4-35.7m-169-196.2a55.65,55.65,0,1,0-55.6-55.6,55.61,55.61,0,0,0,55.6,55.6m-228-125.3a14.08,14.08,0,0,0-14.1,14.1v580.7a14.1,14.1,0,1,0,28.2,0V104.15a14.08,14.08,0,0,0-14.1-14.1" transform="translate(-51.24 -90.05)" fill="#222" />
            </svg>
          </div>
          <div id="map-special-svg-family-restroom">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 648 604.44">
              <path d="M483.26,183.08v386.3c0,20.7,3.14,35.6,25.57,35.6,19.63,0,26.32-13.86,26.32-35.6v-214h10.61v214c0,22.64,8.55,35.6,28.5,35.6,19.25,0,27.17-11.72,27.17-35.6V183.08h12.24V322.52c0,20.29,1.88,32.84,20.75,32.84,15.42,0,21.58-12.38,21.58-32.84V193.68c0-60.18-27-74.85-90.31-74.85H515.52c-64.65,0-86.88,18.41-86.88,77.21V322.52c0,19,2.67,32.84,21.83,32.84,16.63,0,20.56-12.55,20.56-32.84V183.08" transform="translate(-8 -7.22)" fill="#262626" />
              <path d="M97.85,188.81,35.17,411.09H90V575.35c0,17.9,5.81,31.18,23,31.18,16.19,0,23.49-12.42,23.49-31.18V411.09h12.67V575.35c0,17.9,5.81,31.18,23.07,31.18,16.95,0,23.64-13.28,23.64-31.18V411.09h58.29L189.45,188.81l12.84-3.06L242,312.43c3.55,11.83,13.09,18.19,22.2,18.19,10.86,0,18.07-8.11,18.07-18.63,0-1.41,0-5.55-2.25-13.3L243.65,175.23c-12.45-42-35.09-56.37-75.2-56.37H127c-53.8,0-70.43,17.68-79.58,51.26L8,313.13c0,9.38,8.71,18,18.63,18,8.54,0,16.13-5.55,20-17.4l39-127,12.22,2.09" transform="translate(-8 -7.22)" fill="#262626" />
              <path d="M444.91,518.05l-12.71-42.8c-5.36-18.12-17.21-46.31-57.5-46.31H329.6c-40.48,0-52.27,28.19-57.94,46.31l-12.45,42.8c-3.94,11.24-.6,19.51,7.92,22,8.11,2.4,14.93-2.71,18.68-12.67l7.7-29.5c1.82-7,5.6-10,11-8.29,5.18,2.26,5.41,7.32,3.34,14.3,0,0-10.85,72.51-3.74,92,6.62,17.86,32,16,48,15.37,16.16.61,40.9,2.49,47.75-15.37,6.82-19.51-4.18-92-4.18-92-1.23-7-1.23-12,3.94-14.3,5-1.72,8.74,1.25,11,8.29l7.85,29.5c3.15,10,10.42,15.07,18.53,12.67,8.29-2.5,11.59-10.77,7.92-22m-93-102.53A48.95,48.95,0,1,0,303,366.57a48.87,48.87,0,0,0,48.83,48.95" transform="translate(-8 -7.22)" fill="#262626" />
              <path d="M542.27,104.18c25.92,0,47.77-21.76,47.77-49a48.11,48.11,0,0,0-47.77-48c-26,0-47.59,21.39-47.59,48,0,27.24,21.6,49,47.59,49" transform="translate(-8 -7.22)" fill="#262626" />
              <path d="M145.37,104.18c26,0,46.33-21.76,46.33-47.57S171.35,8.66,145.37,8.66s-46.91,22-46.91,48,21,47.57,46.91,47.57" transform="translate(-8 -7.22)" fill="#262626" />
            </svg>
          </div>
          <div id="map-special-svg-elevator">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 581.01 581">
              <path d="M480.87,597H125.13A112.77,112.77,0,0,1,12.5,484.34V128.66A112.77,112.77,0,0,1,125.13,16H480.87A112.77,112.77,0,0,1,593.5,128.66V484.34A112.77,112.77,0,0,1,480.87,597ZM125.13,42.39a86.35,86.35,0,0,0-86.24,86.27V484.34a86.35,86.35,0,0,0,86.24,86.27H480.87a86.35,86.35,0,0,0,86.24-86.27V128.66a86.35,86.35,0,0,0-86.24-86.27Z" transform="translate(-12.5 -16)" fill="#111" />
              <path d="M428.75,273.7a24.08,24.08,0,0,1-17.18-7.13L303,158,194.42,266.57A24.3,24.3,0,0,1,160,232.21l143-143L446,232.21a24.31,24.31,0,0,1-17.2,41.49" transform="translate(-12.5 -16)" fill="#111" />
              <path d="M303,538.3,160.05,395.35A24.31,24.31,0,0,1,194.44,361L303,469.53,411.56,361A24.31,24.31,0,1,1,446,395.35Z" transform="translate(-12.5 -16)" fill="#111" />
            </svg>
          </div>
          <div id="map-special-svg-security">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 752.09 736.37">
              <path d="M28.78,317.59c2.71-4.8,5.33-9.66,8.15-14.4,11-18.36,31.75-27.56,53.13-23.59a49.46,49.46,0,0,1,40.14,39.7c.84,4.22,1.11,8.54,1.85,14.52h27.87c47.62,0,95.26-.18,142.88.32,10.18.1,15.63-2.52,18.93-12.91,19.06-60,38.82-119.85,58.39-179.92C350,120.53,340.16,99.37,349,73.44c6.33-18.56,27.67-33.56,47.89-33.67,21-.11,43.11,15.71,48.91,34.9,8.25,27.35-1.23,46.47-34.08,67.83,24.11,60,48.07,120.23,72.84,180.12,2,4.88,9.59,10.54,14.65,10.61,58.85.74,117.72.47,172.57.47,9.85-16.1,17.17-32.4,28.59-45,6.1-6.72,19.14-9.19,29.27-9.78,23.25-1.37,43.85,15.44,49.75,38,5.34,20.38-4.28,44.15-22.46,55.51-22.92,14.32-42.71,10.61-71.23-13.63-43,36.09-85.92,72.38-129.15,108.32-28,23.26-28.07,23-17.53,57.41q22.77,74.34,45.21,148.64c41.33,4,58.12,15.31,63.85,42.81,4.13,19.85-6.2,42.06-24.53,52.79-19.66,11.49-42.35,9.43-59.3-5.39-19.58-17.12-22.15-38.26-7.81-71.85-18.57-11.81-37.52-23.65-56.24-35.84-31.49-20.49-62.66-41.46-94.41-61.52-4.67-3-13.62-5-17.49-2.51-52.3,33.14-104,67.14-155.92,100.92,13.47,35.69,10.4,56.32-10.74,72.49-18,13.8-41,14.65-59.62,2.2s-26.72-35.64-20-58c7.12-23.77,26.9-35,63.15-34.91Q233,583.23,261.26,490.64L114.85,368c-17.47,11.79-38,19.64-57.78,5.48-11.49-8.21-19-22-28.29-33.28Z" transform="translate(-28.78 -39.77)" fill="#222" />
            </svg>
          </div>
          <div id="map-special-svg-dog-poop-station">
            <svg id="Layer_1" data-name="Layer 1" viewBox="0 0 752.1 736.4">
              <ellipse transform="matrix(0.9488 -0.3159 0.3159 0.9488 -30.6034 83.2258)" fill="#222" cx="241.4" cy="136" rx="85.6" ry="135.9" />
              <ellipse transform="matrix(0.3917 -0.9201 0.9201 0.3917 178.2635 541.6781)" fill="#222" cx="498.8" cy="136" rx="135.8" ry="85.7" />
              <ellipse transform="matrix(0.665 -0.7469 0.7469 0.665 -223.1496 187.105)" fill="#222" cx="97" cy="342.3" rx="74.4" ry="109.6" />
              <ellipse transform="matrix(0.6879 -0.7258 0.7258 0.6879 -19.9475 571.058)" fill="#222" cx="654" cy="308.7" rx="111.1" ry="75.7" />
              <path fill="#222" d="M747.3,578.7c-9.7-67.6-60.5-124.7-119.6-134.8l7.4,1.7c-48.9-3.7-96.1-32.2-126.4-76.3
		c-14.6-21.3-25.8-46.4-44.8-62.7c-15.5-13.3-34.9-19.4-54.1-22.6c-30.9-5.1-63.1-3.3-92.3,9.5s-55,37.1-68.5,69.4
		c-7.4,17.8-11,37.5-18.6,55.2C209.1,468,160.4,494,129.8,537c-22.6,31.8-34.8,73.1-33.6,114.1c0.3,10.8,1.6,22,6.5,31.3
		c4.9,9.5,13.1,16.1,21.4,21.7c40.2,27.1,90.4,34.1,135.1,19c56.2-19,105.8-71.2,164.1-65c21,2.2,40.7,12,60.7,19.4
	c73,27,154.5,22,224.6-13.7c9.8-5,19.6-10.8,26.8-19.9C748.9,626.8,750.6,601.3,747.3,578.7z"/>
            </svg>
          </div>
        </div>
      </div>
    </MeshObjectContextProvider>

  );
}

export default MapBox;
