import { IFloorSelectorProps } from "Hooks/useMeshFloors/types";

const FloorSelector = ({floors, selectedFloorIndex, handleFloorChange, accentColor}: IFloorSelectorProps) => {
    const floorButtons = [];
    for (let i = 0; i < floors; i++) {
        const style = {display: 'flex', cursor: 'pointer', background: 'white'};
        if (i === selectedFloorIndex) {
            style.background = accentColor;
        }
        floorButtons.push(<div key={`floor-change-btn-${i}`} className={`floor control_btn ${i === selectedFloorIndex? 'active' : ''}`}  onClick={handleFloorChange(i)}>Floor {i + 1}</div>)
    }

    return (
        <div className="floors btn_group">
            {floorButtons}
        </div>
    );
}

export default FloorSelector;
