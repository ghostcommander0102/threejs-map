import {Color} from "three";

export function hex_to_color(hex_code: string) {
    return new Color(hex_code.length === 6 ? parseInt('0x' + hex_code, 16) : hex_code);
}

export const getFormatedColor = (color: string) => {
    if (!color.length) return '';

    const r = /#/g;
    return '#' + color.replace(r, '');
}