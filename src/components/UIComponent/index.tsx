import { IAmenitiesInteractiveList, IFloorSelectorProps, TMapMode } from "types"
import FloorSelector from "./FloorSelector"
import { MouseEventHandler } from "react";
import styles from '../../MapBox.module.css';
import ATM from "components/Icons/ATM";
import DogPoopStation from "components/Icons/DogPoopStation";
import Elevator from "components/Icons/Elevator";
import FamilyRestroom from "components/Icons/FamilyRestroom";
import Management from "components/Icons/Management";
import PlayArea from "components/Icons/PlayArea";
import Restroom from "components/Icons/Restroom";
import Security from "components/Icons/Security";

const Names = ['atm', 'dog-poop-station', 'elevator', 'family-restroom', 'management', 'playarea', 'restroom', 'security'] as const;

type TIconName = (typeof Names)[number];

type TAmenityIconProps = {
    type: TIconName,
}

type TElement =  undefined | (() => JSX.Element);

const AmenityIcon = ({type}: TAmenityIconProps) => {
    let name: TElement;
    name = undefined;

    switch (type) {
        case 'atm':
                name = ATM;
            break;
        case 'dog-poop-station':
                name = DogPoopStation;
            break;
        case 'elevator':
                name = Elevator;
            break;
        case 'family-restroom':
                name = FamilyRestroom;
            break;
        case 'management':
                name = Management;
            break;
        case 'playarea':
                name = PlayArea;
            break;
        case 'restroom':
                name = Restroom;
            break;
        case 'security':
                name = Security;
            break;
    
        default:
            break;
    }
    if (name !== undefined) {
        const Comp = name;
        return (
            <>
                <Comp></Comp>
            </>
        )
    } else {
        return null;
    }

}


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
    mode,
}: IFloorSelectorProps & {
    amenitiesList: IAmenitiesInteractiveList[],
    zoomIn?: MouseEventHandler<HTMLDivElement>,
    zoomOut?: MouseEventHandler<HTMLDivElement>,
    reset?: () => void,
    clearRoute?: MouseEventHandler<HTMLDivElement>,
    handleAmenityClick: (type: string) => void,
    mode?: TMapMode,
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
                    {mode !== 'edit' &&
                        <div className={`${styles.amenities}`} style={{ display: 'block' }}>
                            {amenitiesList.map((amenity, index) => (
                                <div key={`amenity-${amenity.name}-${index}`} className={`${styles.amenity}`} style={{ backgroundColor: '#000000' }} onClick={() => handleAmenityClick(amenity.type)}>
                                    <div className={styles.img}>
                                        <AmenityIcon type={amenity.type as TIconName}></AmenityIcon>
                                        {/* <img src={amenity.imageUrl} alt="" /> */}
                                    </div>
                                    <div className={`${styles.name}`}>{amenity.name}</div>
                                </div>
                            ))}
                        </div>
                    }
            </div>
        </div>
 )   
}

export default UIComponent;
