import { IAmenitiesInteractiveList, IFloorSelectorProps } from "types"
import FloorSelector from "./FloorSelector"
import { MouseEventHandler } from "react";
import styles from '../../MapBox.module.css';

const UIComponent = ({
    floors,
    accentColor,
    selectedFloorIndex,
    handleFloorChange,
    amenitiesList,
    zoomIn,
    zoomOut,
    reset,
    clearRoute,
    handleAmenityClick,
}: IFloorSelectorProps & {
    amenitiesList: IAmenitiesInteractiveList[],
    zoomIn?: MouseEventHandler<HTMLDivElement>,
    zoomOut?: MouseEventHandler<HTMLDivElement>,
    reset?: () => void,
    clearRoute?: MouseEventHandler<HTMLDivElement>,
    handleAmenityClick: (type: string) => void
}
) => {
    const handleResetClick: MouseEventHandler = (e) => {
        e.preventDefault();
        if (reset instanceof Function) {
            reset();
        }
    }
 return(
        <div id={styles['threejs-map-wrapper']}>
            <div id={styles['threejs-map']}>
                <div id={styles['map_controls']} className={`${!floors? 'hide' : ''}`}>
                    <div className={styles['btn_group']}>
                        <div onClick={handleResetClick} className={`${styles['reset']} ${styles['control_btn']}`}>RESET</div>
                        <div onClick={clearRoute} className={`${styles['clear_route']} ${styles['control_btn']} ${clearRoute? '' : styles.hide}`}>Clear Route</div>
                    </div>
                    <FloorSelector  accentColor={accentColor} floors={floors} selectedFloorIndex={selectedFloorIndex} handleFloorChange={handleFloorChange}/>
                    <div className={`${styles['btn_group']} ${styles['zoom_btns']}`}>
                        <div onClick={zoomOut} className={`${styles['zoom-out']} ${styles['control_btn']}`}>–</div>
                        <div onClick={zoomIn} className={`${styles['zoom-in']} ${styles['control_btn']}`}>+</div>
                    </div>
                </div>
                <div id={styles['mapit2_loader']} className={styles['hide']}>Loading map, please wait...</div>
                <div className={`${styles.amenities} ${styles['ng-scope']}`} style={{ display: 'none' }}>
                    {amenitiesList.map((amenity, index) => (
                        <div key={`amenity-${amenity.name}-${index}`} className={`${styles.amenity} ${styles['ng-scope']}`} style={{ backgroundColor: '#000000' }} onClick={() => handleAmenityClick(amenity.type)}>
                            <div className={styles.img}>
                                <img src={amenity.imageUrl} alt="" />
                            </div>
                            <div className={`${styles.name} ${styles['ng-binding']}`}>{amenity.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
 )   
}

export default UIComponent;
