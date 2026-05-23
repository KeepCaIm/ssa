import { STELLARIS_UI } from '../StellarisUiConstants.js';

/**
 * SystemsRendererHelper
 * Pure functional helpers isolating string casing logic and resource array mapping.
 */
export const toTitleCaseStar = (trimmedStar) => {
  return trimmedStar
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getStarIcon = (trimmedStar) => {
  const low = trimmedStar.toLowerCase();
  if (low.includes("black_hole") || low.includes("blackhole") || low.includes("black hole")) return "🕳️";
  if (low.includes("neutron")) return "⚛️";
  if (low.includes("pulsar")) return "⚡";
  if (low.includes("giant") || low.includes("supergiant") || low.includes("nova")) return "💥";
  return "☀️";
};

export const getResourceConfig = (p) => [
  { cond: p.e > 0, val: p.e, ico: "⚡", col: STELLARIS_UI.colors.mid, label: "Energy" },
  { cond: p.m > 0, val: p.m, ico: "⛏️", col: "#e88024", label: "Minerals" },
  { cond: p.a > 0, val: p.a, ico: "🛡️", col: STELLARIS_UI.colors.high, label: "Alloys" },
  { cond: p.p > 0, val: p.p, ico: "⚛️", col: STELLARIS_UI.colors.textSub, label: "Physics" },
  { cond: p.s > 0, val: p.s, ico: "🍃", col: "#5ce681", label: "Society" },
  { cond: p.g > 0, val: p.g, ico: "⚙️", col: "#e6b65c", label: "Engineering" },
  { cond: p.n > 0, val: p.n, ico: "🔮", col: "#b446e3", label: "Specials" }
];
