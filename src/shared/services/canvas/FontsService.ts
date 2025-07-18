import { fontsPaths } from "assets-paths";
import { registerFont } from "canvas";

export function loadFonts(): void {
    const fonts = fontsPaths;
    fonts.forEach(font => {
        console.log("Fonts - Registering", font.name);
        registerFont(font.path, { family: font.name });
    });

    return;
}