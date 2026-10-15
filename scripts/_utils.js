// =============================================================================
// _utils.js — fonctions partagées entre tous les tests
// Import dans un test :  import { lerp, clamp, map } from './_utils.js';
// =============================================================================

// Interpolation linéaire : lerp(0, 100, 0.5) → 50
// Utile pour lisser un mouvement : x = lerp(x, cible, 0.1) à chaque frame.
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Bloque une valeur entre min et max : clamp(150, 0, 100) → 100
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Remappe une valeur d'une plage à une autre :
// map(50, 0, 100, 0, 1) → 0.5
// map(pointer.x, 0, innerWidth, -10, 10) → de -10 à 10 selon la position
// clampResult = true pour rester dans la plage de sortie.
export function map(value, inMin, inMax, outMin, outMax, clampResult = false) {
  const t = (value - inMin) / (inMax - inMin);
  const result = outMin + (outMax - outMin) * t;
  if (!clampResult) return result;
  return clamp(result, Math.min(outMin, outMax), Math.max(outMin, outMax));
}

// Distance entre deux points : distance(x1, y1, x2, y2)
export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Rectangle d'un élément, en coordonnées de la fenêtre (comme room.pointer),
// avec son centre (cx, cy) en plus.
export function getRect(el) {
  const r = el.getBoundingClientRect();
  return {
    x: r.left,
    y: r.top,
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
  };
}

// true si les rectangles de deux éléments se chevauchent
export function isColliding(elA, elB) {
  const a = elA.getBoundingClientRect();
  const b = elB.getBoundingClientRect();
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// Modifie une variable CSS : setVar('--room-gap', '40px') ou setVar('room-gap', '40px')
// Par défaut sur :root ; passer un élément en 3e argument pour la limiter à lui.
export function setVar(name, value, el = document.documentElement) {
  const prop = name.startsWith('--') ? name : `--${name}`;
  el.style.setProperty(prop, value);
}
