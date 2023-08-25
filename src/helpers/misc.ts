import {Color} from "three";

export function hex_to_color(hex_code: string) {
    return new Color(parseInt('0x' + hex_code, 16));
}