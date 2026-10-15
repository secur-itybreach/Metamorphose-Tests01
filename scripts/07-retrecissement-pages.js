// =============================================================================
// 07-retrecissement-pages.js — comme 04-retrecissement, mais piloté par la page
// De page en page, les bords de l'écran rentrent : l'espace visible rétrécit
// et la chambre se réarrange dans la largeur qui reste
// (6 colonnes → 2 colonnes → 1 colonne ; sur mobile 2 → 1).
// =============================================================================

import { lerp } from './_utils.js';

export const usesPages = true; // affiche la navigation entre les pages

const MIN_WIDTH = 0.3;    // largeur visible minimale (30 % de l'écran)
const MIN_WIDTH_PX = 280; // ...mais jamais moins de 280 px (lisibilité)
const MAX_INSET_Y = 0.2;  // les bords haut et bas rentrent jusqu'à 20 % de l'écran

// Dispositions selon la largeur disponible pour la chambre
const LAYOUT_2_COLS = `
  "cadre   armoire"
  "texte-1 texte-1"
  "bureau  chaise "
  "texte-2 texte-2"
  "lit     lit    "
  "texte-3 texte-3"
  "commode commode"
  "texte-4 texte-4"`;

const LAYOUT_1_COL = `
  "cadre"   "texte-1" "armoire" "bureau"
  "texte-2" "chaise"  "lit"     "texte-3"
  "commode" "texte-4"`;

let frame;

export function setup(room) {
  // Cadre noir par-dessus la page : ses bordures sont les bords qui rentrent
  frame = document.createElement('div');
  Object.assign(frame.style, {
    position: 'fixed',
    inset: '0',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: '0',
    pointerEvents: 'none',
    zIndex: '500',
  });
  document.body.append(frame);

  // Le nom du test reste visible au-dessus du cadre
  document.getElementById('test-label').style.zIndex = '1000';
}

export function update(room) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const p = room.progress; // 0 sur la première page, 1 sur la dernière

  // Bords qui rentrent
  const minWidth = Math.min(W, Math.max(W * MIN_WIDTH, MIN_WIDTH_PX));
  const insetX = lerp(0, (W - minWidth) / 2, p);
  const insetY = lerp(0, H * MAX_INSET_Y, p);
  frame.style.borderWidth = `${insetY}px ${insetX}px`;

  // La chambre prend exactement la largeur visible
  const width = W - insetX * 2;
  room.el.style.width = `${width}px`;
  room.el.style.marginLeft = `${insetX}px`;
  // Le haut et le bas de la chambre restent atteignables malgré les bords
  room.el.style.paddingTop = `${insetY + 32}px`;
  room.el.style.paddingBottom = `${insetY + 32}px`;
  // La navigation en bas de page passe au-dessus du bord noir
  document.getElementById('page-nav').style.marginBottom = `${insetY}px`;
  document.getElementById('page-nav').style.marginLeft = `${insetX}px`;
  document.getElementById('page-nav').style.width = `${width}px`;

  // Réarrangement selon la place disponible
  const s = room.el.style;
  if (width >= 760 || insetX === 0) {
    // Disposition d'origine (celle du CSS, desktop ou mobile)
    s.gridTemplateAreas = '';
    s.gridTemplateColumns = '';
    s.gridTemplateRows = '';
    s.gridAutoRows = '';
  } else if (width >= 360) {
    s.gridTemplateAreas = LAYOUT_2_COLS;
    s.gridTemplateColumns = '1fr 1fr';
    s.gridTemplateRows = 'none';
    s.gridAutoRows = 'minmax(30vh, auto)';
  } else {
    s.gridTemplateAreas = LAYOUT_1_COL;
    s.gridTemplateColumns = '1fr';
    s.gridTemplateRows = 'none';
    s.gridAutoRows = 'minmax(25vh, auto)';
  }
}
