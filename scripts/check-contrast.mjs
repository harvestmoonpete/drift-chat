import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/g)].map((m) => [m[1], m[2]]),
);
const luminance = (hex) =>
  hex
    .slice(1)
    .match(/../g)
    .map((s) => parseInt(s, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((n, c, i) => n + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
for (const foreground of ["text", "secondary", "muted", "accent"])
  for (const background of ["background", "surface", "raised", "selected"]) {
    const ratio = contrast(tokens[foreground], tokens[background]);
    assert(ratio >= 4.5, `${foreground}/${background}: ${ratio}`);
    console.log(`${foreground}/${background}: ${ratio.toFixed(2)}:1`);
  }
for (const [fg, bg, min] of [
  ["on-accent", "accent", 4.5],
  ["control-border", "surface", 3],
  ["control-border", "raised", 3],
]) {
  const ratio = contrast(tokens[fg], tokens[bg]);
  assert(ratio >= min, `${fg}/${bg}: ${ratio}`);
  console.log(`${fg}/${bg}: ${ratio.toFixed(2)}:1`);
}
