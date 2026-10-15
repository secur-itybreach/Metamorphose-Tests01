// =============================================================================
// 03-cafard.js
// La souris est remplacée par un cafard qui grandit avec le scroll
// (jusqu'à un tiers de la largeur de l'écran) et repousse meubles et textes.
// =============================================================================

import { lerp, clamp, distance } from './_utils.js';

const MIN_SIZE = 40;   // taille du cafard en haut de la page (px)
const MARGIN = 1.2;    // zone de répulsion = rayon du cafard × MARGIN
const EASE = 0.15;     // douceur du mouvement des éléments repoussés

let cafard;
const offsets = new Map(); // décalage actuel de chaque élément { x, y }

export function setup(room) {
  // Cache la vraie souris
  document.documentElement.style.cursor = 'none';

  // Les éléments repoussés ne doivent pas créer de scroll en dépassant
  room.el.style.overflow = 'clip';

  // Crée le cafard
  cafard = document.createElement('img');
  cafard.src = 'cafard.webp';
  cafard.alt = '';
  Object.assign(cafard.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    pointerEvents: 'none',
    zIndex: '1000',
  });
  document.body.append(cafard);

  [...room.meubles, ...room.textes].forEach((el) => offsets.set(el, { x: 0, y: 0 }));
}

export function update(room) {
  // Taille du cafard selon le scroll : 0 en haut, 1 en bas
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const p = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
  const size = lerp(MIN_SIZE, window.innerWidth / 3, p);

  // Le cafard suit le pointeur (centré dessus)
  const { x, y } = room.pointer;
  cafard.style.width = `${size}px`;
  cafard.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;

  // Répulsion
  const radius = (size / 2) * MARGIN;
  offsets.forEach((offset, el) => {
    // Position de l'élément sans son décalage actuel
    const r = el.getBoundingClientRect();
    const left = r.left - offset.x;
    const top = r.top - offset.y;
    const right = left + r.width;
    const bottom = top + r.height;

    // Point de l'élément le plus proche du cafard
    const px = clamp(x, left, right);
    const py = clamp(y, top, bottom);
    const d = distance(x, y, px, py);

    let tx = 0; // décalage visé
    let ty = 0;

    if (d > 0) {
      // Cafard à côté : l'élément s'écarte, d'autant plus que le cafard est proche
      const push = Math.max(0, radius - d);
      tx = ((px - x) / d) * push;
      ty = ((py - y) / d) * push;
      offset.exit = null;
    } else {
      // Cafard dessus : l'élément sort par son bord le plus proche du cafard
      const exits = [
        { d: x - left, x: 1, y: 0 },    // bord gauche → l'élément part à droite
        { d: right - x, x: -1, y: 0 },  // bord droit  → à gauche
        { d: y - top, x: 0, y: 1 },     // bord haut   → en bas
        { d: bottom - y, x: 0, y: -1 }, // bord bas    → en haut
      ];
      // Le côté est choisi une fois, puis gardé tant que le cafard est dessus
      // (sinon l'élément hésite entre deux côtés à égale distance)
      if (offset.exit === null || offset.exit === undefined) {
        offset.exit = exits.indexOf(exits.reduce((a, b) => (b.d < a.d ? b : a)));
      }
      const exit = exits[offset.exit];
      tx = exit.x * (exit.d + radius);
      ty = exit.y * (exit.d + radius);
    }

    offset.x = lerp(offset.x, tx, EASE);
    offset.y = lerp(offset.y, ty, EASE);
    el.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
  });
}
