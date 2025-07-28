import { fontsPaths } from "assets-paths";
import { FontLibrary } from "skia-canvas";

export function loadFonts(): void {
    const fonts = fontsPaths;
    fonts.forEach(font => {
        console.log("Fonts - Registering", font.name);
        FontLibrary.use(font.name, font.path);
    });

    return;
}