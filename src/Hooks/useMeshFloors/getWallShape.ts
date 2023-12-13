import {LineCurve, Shape, Vector3} from "three";

export function getWallShape(curve: LineCurve, thickness = 3, shape_extend = 0) {
    let wallShape = new Shape();
    let point1 = new Vector3(curve.v1.x, curve.v1.y, 0);
    let point2 = new Vector3(curve.v2.x, curve.v2.y, 0);

    // form help and formulas in /assets/threejs/help/
    let dir = point2.clone().sub(point1).normalize().multiplyScalar(-thickness * shape_extend);
    let point1_center = point1.clone().add(dir);

    dir = point1.clone().sub(point2).normalize().multiplyScalar(-thickness * shape_extend);
    let point2_center = point2.clone().add(dir);

    let distance = point1.distanceTo(point2_center);

    let point1_above = {
        x: point1_center.x - (point2.y - point1_center.y) * thickness / distance,
        y: point1_center.y - (point1_center.x - point2.x) * thickness / distance
    };
    let point1_below = {
        x: point1_center.x + (point2.y - point1_center.y) * thickness / distance,
        y: point1_center.y + (point1_center.x - point2.x) * thickness / distance
    };

    let point2_above = {
        x: point2_center.x + (point1.y - point2_center.y) * thickness / distance,
        y: point2_center.y + (point2_center.x - point1.x) * thickness / distance
    };
    let point2_below = {
        x: point2_center.x - (point1.y - point2_center.y) * thickness / distance,
        y: point2_center.y - (point2_center.x - point1.x) * thickness / distance
    };

    wallShape.moveTo(point1_above.x, point1_above.y);
    wallShape.lineTo(point1_below.x, point1_below.y);
    wallShape.lineTo(point2_below.x, point2_below.y);
    wallShape.lineTo(point2_above.x, point2_above.y);

    // shape.moveTo(point1_above.x, point1_above.y);
    // shape.bezierCurveTo(point1_above.x, point1_above.y, point1_long_center.x, point1_long_center.y, point1_below.x, point1_below.y);
    // shape.lineTo(point2_below.x, point2_below.y);
    // shape.bezierCurveTo(point2_below.x, point2_below.y, point2_long_center.x, point2_long_center.y, point2_above.x, point2_above.y);

    return wallShape;
}