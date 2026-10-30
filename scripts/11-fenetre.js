// =============================================================================
// 11-fenetre.js — variante de 04-retrecissement
// Au fil du scroll, les bords de l'écran rentrent : l'espace visible rétrécit
// et la chambre se réarrange dans la largeur qui reste.
// Une fois le rétrécissement fini et le bas de la chambre atteint, la chambre
// se bloque (plus aucun scroll) et une fenêtre à deux battants se referme
// sur l'espace visible (vitres transparentes, cadre noir).
// =============================================================================

import { lerp, clamp } from './_utils.js';

const MIN_WIDTH = 0.3;    // largeur visible minimale (30 % de l'écran)
const MIN_WIDTH_PX = 280; // ...mais jamais moins de 280 px (lisibilité)
const MAX_INSET_Y = 0.2;  // les bords haut et bas rentrent jusqu'à 20 % de l'écran
const SHRINK_RANGE = 2;   // scroll pour le rétrécissement (en hauteurs d'écran)
const CLOSE_RANGE = 1;    // scroll pour fermer la fenêtre (en hauteurs d'écran)
const PANES = 3;          // nombre de vitres par battant
const LINE = 20;           // épaisseur du cadre des battants (px)
const PERSPECTIVE = 1000; // profondeur de la 3D (plus petit = effet plus fort)

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
let fenetre;              // conteneur de la fenêtre, à la taille de l'espace visible
let battants = [];        // [gauche, droite]
let baseMinHeight = '';   // hauteur minimale de la page hors fermeture
let closeStart = null;    // scroll où la chambre s'est bloquée (null = pas bloquée)

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

  // Fenêtre : un conteneur avec de la perspective, et deux battants dedans
  fenetre = document.createElement('div');
  Object.assign(fenetre.style, {
    position: 'fixed',
    perspective: `${PERSPECTIVE}px`,
    pointerEvents: 'none',
    zIndex: '600',
  });
  battants = ['left', 'right'].map((side) => {
    const b = document.createElement('div');
    Object.assign(b.style, {
      position: 'absolute',
      top: '0',
      [side]: '0',                       // collé à sa charnière
      width: '50%',
      height: '100%',
      display: 'grid',
      gridTemplateRows: `repeat(${PANES}, 1fr)`,
      border: `${LINE}px solid #000`,
      transformOrigin: side,             // la charnière est sur le bord extérieur
    });
    // Les vitres : vides (transparentes), séparées par des traverses noires
    for (let i = 0; i < PANES; i++) {
      const vitre = document.createElement('div');
      if (i > 0) vitre.style.borderTop = `${LINE / 2}px solid #000`;
      b.append(vitre);
    }
    fenetre.append(b);
    return b;
  });
  document.body.append(fenetre);

  // Le nom du test reste visible au-dessus du cadre
  document.getElementById('test-label').style.zIndex = '1000';

  // Distance de scroll fixe pour le rétrécissement : la page s'allonge quand
  // la chambre se resserre, mais l'effet reste calé sur cette distance
  baseMinHeight = `${(SHRINK_RANGE + 1) * window.innerHeight}px`;
  document.body.style.minHeight = baseMinHeight;
  document.documentElement.style.overflowAnchor = 'none';
}

export function update(room) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const p = clamp(window.scrollY / (SHRINK_RANGE * H), 0, 1); // 1. rétrécissement

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

  // 2. Blocage : quand le rétrécissement est fini et que le bas de la chambre
  //    atteint le bas de l'écran, la chambre passe en position fixe, collée en bas.
  //    Elle ne bouge plus du tout ; le scroll restant sert à fermer la fenêtre.
  if (closeStart === null) {
    const bottom = room.el.getBoundingClientRect().bottom;
    if (p === 1 && bottom <= H) {
      closeStart = window.scrollY - (H - bottom); // scroll exact où le bas a été atteint
      document.body.style.minHeight = `${closeStart + (CLOSE_RANGE + 1) * H}px`;
      Object.assign(room.el.style, { position: 'fixed', left: '0', bottom: '0' });
    }
  } else if (window.scrollY < closeStart) {
    // On remonte : la chambre se débloque et défile à nouveau
    closeStart = null;
    document.body.style.minHeight = baseMinHeight;
    Object.assign(room.el.style, { position: '', left: '', bottom: '' });
  }

  // 3. Fermeture de la fenêtre (0 → 1)
  const close = closeStart === null ? 0 : clamp((window.scrollY - closeStart) / (CLOSE_RANGE * H), 0, 1);

  // La fenêtre couvre l'espace visible et ses battants se referment
  // (90° = ouverts, vus par la tranche ; 0° = fermés)
  Object.assign(fenetre.style, {
    left: `${insetX}px`,
    top: `${insetY}px`,
    width: `${width}px`,
    height: `${H - insetY * 2}px`,
    display: close > 0 ? 'block' : 'none',
  });
  const angle = lerp(90, 0, close);
  battants[0].style.transform = `rotateY(${-angle}deg)`; // s'ouvre vers nous
  battants[1].style.transform = `rotateY(${angle}deg)`;

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
