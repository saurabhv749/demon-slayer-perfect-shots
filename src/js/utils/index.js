import FontFaceObserver from "fontfaceobserver";

export function loadFonts(fonts, cb) {
  const _fonts = fonts.map((f) => new FontFaceObserver(f, {}));
  const promises = _fonts.map((font) => font.load());

  Promise.all(promises)
    .then(cb)
    .catch((e) => console.log("font loading failed", e));
}

export const clamp = (min, max, x) => Math.min(Math.max(x, min), max);
