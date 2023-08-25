import { IAmenitiesInteractiveList, IFloorSelectorProps } from "Hooks/useMeshFloors/types"
import FloorSelector from "./FloorSelector"
import { MouseEventHandler } from "react";

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
        <div id="threejs-map-wrapper">
            <div id="threejs-map">
                <div id="map_controls" className={`${!floors? 'hide' : ''}`}>
                    <div className="btn_group">
                        <div onClick={handleResetClick} className="reset control_btn">RESET</div>
                        <div onClick={clearRoute} className={`clear_route control_btn ${clearRoute? '' : 'hide'}`}>Clear Route</div>
                    </div>
                    <FloorSelector  accentColor={accentColor} floors={floors} selectedFloorIndex={selectedFloorIndex} handleFloorChange={handleFloorChange}/>
                    <div className="btn_group zoom_btns">
                        <div onClick={zoomOut} className="zoom-out control_btn">–</div>
                        <div onClick={zoomIn} className="zoom-in control_btn">+</div>
                    </div>
                </div>
                <div id="mapit2_loader" className="hide">Loading map, please wait...</div>
                <div className="amenities ng-scope" style={{ display: 'block' }}>
                    {amenitiesList.map((amenity, index) => (
                        <div key={`amenity-${amenity.name}-${index}`} className="amenity ng-scope" style={{ backgroundColor: '#000000' }} onClick={() => handleAmenityClick(amenity.type)}>
                            <div className="img">
                                <img src={amenity.imageUrl} alt="" />
                            </div>
                            <div className="name ng-binding">{amenity.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
 )   
}

export default UIComponent;
