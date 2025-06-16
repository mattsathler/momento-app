export function hexToRgb(hex: string): [number, number, number] {
    const cleaned = hex.replace('#', '');
    const bigint = parseInt(cleaned, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function adjustLightness(rgb: [number, number, number], amount: number): [number, number, number] {
    return rgb.map(c => Math.min(255, Math.max(0, c + amount))) as [number, number, number];
}

export function generateSurface(background: string): string {
    const rgb = hexToRgb(background);
    const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
    const adjustment = avg > 127 ? -16 : 16;
    const adjusted = adjustLightness(rgb, adjustment);
    return rgbToHex(...adjusted);
}