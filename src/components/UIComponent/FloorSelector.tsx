import { IFloorSelectorProps } from "../../types";
import styles from '../../MapBox.module.css';

type TFloorButtonProps = {
    isActive: boolean,
    onClick: (e: any) => void,
    text: string,
}

const FloorButton = ({isActive, onClick, text }: TFloorButtonProps) => {
    return (

        <div
            className={`${styles.floor} ${styles.control_btn} ${isActive ? styles.active : ''}`} onClick={onClick}
        >
            {text}
        </div>
    )
}

const FloorSelector = ({floors, selectedFloorIndex, handleFloorChange, accentColor}: IFloorSelectorProps) => {
    const floorButtons: Array<TFloorButtonProps & {key: string}> = [];
    for (let i = 0; i < floors.length; i++) {
        const style = {display: 'flex', cursor: 'pointer', background: 'white'};
        if (i === selectedFloorIndex) {
            style.background = accentColor;
        }
        floorButtons.push({
            key: `floor-change-btn-${i}`,
            isActive: i === selectedFloorIndex,
            onClick: handleFloorChange(i),
            text: floors[i].title,
        })
    }

    return (
        <div className={`${styles.floors} ${styles.btn_group}`}>
            {floorButtons.map(value => <FloorButton key={value.key} isActive={value.isActive} onClick={value.onClick} text={value.text} ></FloorButton>)}
        </div>
    );
}

export default FloorSelector;
