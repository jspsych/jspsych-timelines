/**
 * @license Drawings original to @jspsych-timelines/two-step-task (abstract symbols, spaceships, planets, aliens,
 * coin), MIT License:
 *
 * Copyright (c) 2023 jspsych (the repository licence; drawings added in 2026)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/**
 * The drawings of the bundled stimulus sets: simple shapes written for this package (circles, paths and
 * rectangles in a 100 x 100 view box), not taken from any study or icon set. They stand in for the studies' own
 * pictures (Expfactory's symbol images, the spaceship and alien pictures of the Kool and Niv lab jsPsych tasks, S025, S026), which are not bundled.
 */

/** A drawing as a whole SVG element: `inner` markup in a 100 x 100 view box. */
export function drawing(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
}

export const ABSTRACT = {
  ring: `<circle cx="50" cy="50" r="32" fill="none" stroke="#ffd166" stroke-width="12"/>`,
  cross: `<path d="M50 14v72M14 50h72" stroke="#06d6a0" stroke-width="14" stroke-linecap="butt"/>`,
  circle: `<circle cx="50" cy="50" r="34" fill="#ffd6a5"/>`,
  square: `<rect x="18" y="18" width="64" height="64" fill="#caffbf"/>`,
  triangle: `<path d="M50 14 88 82H12Z" fill="#bdb2ff"/>`,
  diamond: `<path d="M50 10 90 50 50 90 10 50Z" fill="#9bf6ff"/>`,
  red_screen: `<rect x="14" y="14" width="72" height="72" rx="6" fill="#b23a48"/>`,
  blue_screen: `<rect x="14" y="14" width="72" height="72" rx="6" fill="#3a6ea5"/>`,
};

const planet = (color: string) =>
  `<circle cx="50" cy="50" r="38" fill="${color}"/><ellipse cx="50" cy="52" rx="48" ry="10" fill="none" stroke="#f1f5f9" stroke-width="3" opacity=".7"/>`;

export const SPACE = {
  rocket: `<path d="M50 8C64 24 68 44 66 68H34C32 44 36 24 50 8Z" fill="#ff8c42"/><path d="M34 52 20 76l14-4ZM66 52l14 24-14-4Z" fill="#d1495b"/><circle cx="50" cy="42" r="8" fill="#f1f5f9"/><path d="M42 68h16l-8 22Z" fill="#ffd166"/>`,
  saucer: `<ellipse cx="50" cy="60" rx="42" ry="14" fill="#2ec4b6"/><path d="M30 56C32 30 68 30 70 56Z" fill="#a8dadc"/><circle cx="26" cy="62" r="3" fill="#ffd166"/><circle cx="50" cy="66" r="3" fill="#ffd166"/><circle cx="74" cy="62" r="3" fill="#ffd166"/>`,
  red_planet: planet("#b23a48"),
  blue_planet: planet("#3a6ea5"),
  green_alien: `<circle cx="50" cy="54" r="34" fill="#7bd88f"/><circle cx="50" cy="50" r="12" fill="#f1f5f9"/><circle cx="50" cy="50" r="5" fill="#16202e"/>`,
  yellow_alien: `<rect x="20" y="24" width="60" height="58" rx="8" fill="#ffd166"/><circle cx="38" cy="46" r="6" fill="#16202e"/><circle cx="62" cy="46" r="6" fill="#16202e"/><rect x="38" y="64" width="24" height="5" fill="#16202e"/><path d="M50 24V10" stroke="#ffd166" stroke-width="5"/>`,
  pink_alien: `<path d="M50 14 90 84H10Z" fill="#ff8fab"/><circle cx="40" cy="62" r="6" fill="#16202e"/><circle cx="60" cy="62" r="6" fill="#16202e"/><path d="M38 14 30 4M62 14 70 4" stroke="#ff8fab" stroke-width="5"/>`,
  purple_alien: `<ellipse cx="50" cy="54" rx="26" ry="38" fill="#b388eb"/><circle cx="38" cy="44" r="5" fill="#f1f5f9"/><circle cx="62" cy="44" r="5" fill="#f1f5f9"/><circle cx="50" cy="62" r="5" fill="#f1f5f9"/>`,
};

export const REWARD = {
  coin: `<circle cx="50" cy="50" r="42" fill="#f4c430" stroke="#b8860b" stroke-width="6"/><circle cx="50" cy="50" r="26" fill="none" stroke="#b8860b" stroke-width="5"/>`,
  no_coin: `<circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="10 8"/><path d="M26 74 74 26" stroke="#94a3b8" stroke-width="6"/>`,
};
