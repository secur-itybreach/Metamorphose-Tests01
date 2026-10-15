// =============================================================================
// 05-ecrasement-pages.js — comme 02-ecrasement, mais piloté par la page
// À chaque page, les meubles grandissent (en gardant leurs proportions) jusqu'à
// toucher un autre meuble ou le bord de l'écran. Les marges diminuent et le
// texte se réarrange dans la place qui reste, sans descendre sous 12em de large.
// =============================================================================

import { lerp, isColliding } from './_utils.js';

export const usesPages = true; // affiche la navigation entre les pages

const START = 0.6;        // taille de départ : 60 % de la case du CSS
const MAX_SCALE = 3;      // taille max visée sur la dernière page (×3 la taille de départ)
const EASE = 0.15;        // douceur de l'agrandissement (plus petit = plus doux)

const sizes = new Map();  // taille de départ de chaque meuble { w, h }
const scales = new Map(); // agrandissement actuel de chaque meuble

export function setup(room) {
  // 1. Taille de départ de chaque meuble (d'après la mise en page du CSS)
  room.meubles.forEach((m) => {
    const r = m.getBoundingClientRect();
    sizes.set(m, { w: r.width * START, h: r.height * START });
    scales.set(m, 1);
    m.style.placeSelf = 'center';
    setScale(m, 1);
  });

  // 2. Les lignes de la grille s'adaptent à leur contenu (plus de hauteurs fixes)
  room.el.style.gridTemplateRows = 'none';
  room.el.style.gridAutoRows = 'auto';

  // 3. Le texte ne devient jamais trop étroit pour être lu
  room.textes.forEach((t) => (t.style.minWidth = '12em'));
}

export function update(room) {
  // Progression : 0 sur la première page, 1 sur la dernière
  const p = room.progress;

  // Les marges diminuent
  room.el.style.gap = `${lerp(24, 0, p)}px`;
  room.el.style.padding = `${lerp(32, 0, p)}px`;
  room.textes.forEach((t) => (t.style.padding = `${lerp(0, 8, p)}px`));

  // Chaque meuble avance doucement vers la taille visée, sans dépasser sa limite
  const target = lerp(1, MAX_SCALE, p);
  room.meubles.forEach((m) => {
    let s = scales.get(m);

    if (s > target) {
      // Le meuble rapetisse (ça libère toujours de la place)
      s = lerp(s, target, EASE);
    } else if (target - s > 0.001) {
      // On essaie un peu plus grand ; si ça ne rentre pas, la moitié de ce pas
      const next = lerp(s, target, EASE);
      if (tryScale(room, m, next)) s = next;
      else if (tryScale(room, m, (s + next) / 2)) s = (s + next) / 2;
      else if (!tryScale(room, m, s)) s = Math.max(1, s - 0.01); // poussé par un voisin
    }

    scales.set(m, s);
    setScale(m, s);
  });
}

function setScale(m, scale) {
  const { w, h } = sizes.get(m);
  m.style.width = `${w * scale}px`;
  m.style.height = `${h * scale}px`;
}

// Applique une taille et dit si elle rentre
function tryScale(room, m, scale) {
  setScale(m, scale);
  return fits(room, m);
}

// Le meuble est-il dans l'écran, sans toucher les autres ?
function fits(room, m) {
  const r = m.getBoundingClientRect();
  const insideScreen =
    r.left >= 0 &&
    r.right <= document.documentElement.clientWidth &&
    r.height <= window.innerHeight &&
    room.el.scrollWidth <= room.el.clientWidth;
  const touchesOther = room.meubles.some((o) => o !== m && isColliding(m, o));
  return insideScreen && !touchesOther;
}
