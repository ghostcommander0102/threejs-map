import data from "demo/data.json";
import { defaultVars, mapit2DefaultVars } from "Hooks/useMeshFloors/defaults";
import { Color, Vector3 } from "three";
import { getMeshGroupBoundingBox} from 'helpers/draw.logo.helpers';
import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";

const config = { ...defaultVars, ...mapit2DefaultVars}


const getCenterPoint = (mesh) => {
    var mesh_center_point = new Vector3();
    getMeshGroupBoundingBox(mesh).getCenter(mesh_center_point);
    return mesh_center_point;
}

const useYouAreHereMarker = ({currKioskObj, mapCenterMarker, camera}) => {
    const { size } = useThree();
    useFrame(() => {
		if (currKioskObj != null && ['WEBSITE', 'DISPLAY_APP', 'PORTAL_KIOSK'].includes(config.ROLE)) {
			const youAreHerePoint = getCenterPoint(currKioskObj);
			currKioskObj.localToWorld(youAreHerePoint);
			youAreHerePoint.project(camera);
			const x = ((youAreHerePoint.x * .5 + .5) * size.width.toFixed(2));
			const y = ((youAreHerePoint.y * -.5 + .5) * size.height.toFixed(2));
			mapCenterMarker.style.transform = 'translate(' + x + 'px,' + y + 'px)';
            mapCenterMarker.style.display = 'block';
            mapCenterMarker.style.top = '0px';
            mapCenterMarker.style.left = '0px';
		}
    })
};

export default useYouAreHereMarker;
