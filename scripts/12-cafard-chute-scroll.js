// =============================================================================
// 12-cafard-chute-scroll.js — 10-cafard-chute + agrandissement au scroll (comme 03-cafard)
// Le cafard suit la souris et grandit avec le scroll (jusqu'à un tiers de l'écran) :
// plus il est gros, plus il se cogne facilement, et plus il est lourd à relever
// (il suit la souris avec du retard pendant le drag et doit être levé plus haut). S'il se cogne contre un meuble, il tombe en bas
// de l'écran, sur le dos. Pour le relever : le cliquer et le glisser vers le haut.
// Tant qu'il est sur le dos, la navigation entre les pages est bloquée.
// =============================================================================

import { lerp, clamp, distance } from './_utils.js';

export const usesPages = true; // affiche la navigation entre les pages

// --- RÉGLAGES -----------------------------------------------------------------
const FOLLOW = 0.12;       // 1 = collé au pointeur, plus petit = traîne derrière
const MIN_SIZE = 40;       // largeur du cafard en haut de la page (px)
const MAX_SIZE = window.innerWidth / 3;  // en bas de la page : un tiers de la largeur de l'écran
const DOS_RATIO = 1.5;     // sur le dos, il est 1,5 fois plus large que debout
const HITBOX = 0.35;       // rayon de collision = taille × HITBOX
const GRAVITY = 0.8;       // vitesse de chute
const LIFT_SMALL = 50;    // hauteur à soulever pour le relever, cafard petit (px)
const LIFT_BIG = 0.2;      // ...cafard au maximum (part de la hauteur de l'écran)
const DRAG_SMALL = 0.6;    // pendant le drag, suit la souris : vite quand il est petit...
const DRAG_BIG = 0.04;     // ...lentement quand il est gros (impression de poids)
const GRACE = 800;  
       // après l'avoir relevé, ms pendant lesquelles il ne peut pas retomber
// -----------------------------------------------------------------------------

let cafard;
let nav;
let state = 'wait';        // 'wait' | 'follow' | 'falling' | 'dos' | 'drag'
let vy = 0;                // vitesse de chute
let dragStartY = 0;
let graceUntil = 0;
let size = MIN_SIZE;       // taille actuelle (debout), dépend du scroll
let p = 0;                 // progression du scroll : 0 en haut, 1 en bas
const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

export function setup(room) {
  nav = document.getElementById('page-nav');

  cafard = document.createElement('img');
  cafard.src = 'cafard.webp';
  cafard.alt = '';
  cafard.draggable = false; // pas de glisser-déposer natif de l'image
  Object.assign(cafard.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    pointerEvents: 'none',
    touchAction: 'none',
    zIndex: '1000',
  });
  document.body.append(cafard);

  // Le cafard apparaît sur le pointeur au premier mouvement
  cafard.style.visibility = 'hidden';
  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    cafard.style.visibility = '';
    graceUntil = performance.now() + GRACE;
    state = 'follow';
  }, { once: true });

  // Précharge l'image du dos pour qu'elle s'affiche tout de suite
  new Image().src = 'cafard-dos.png';

  // Relever le cafard : cliquer dessus quand il est sur le dos...
  cafard.addEventListener('pointerdown', (e) => {
    if (state !== 'dos') return;
    e.preventDefault();
    state = 'drag';
    dragStartY = pos.y; // la hauteur se mesure sur le cafard, pas sur la souris
    cafard.style.cursor = 'grabbing';
  });

  // ...et relâcher quand le cafard (pas la souris) est assez haut
  window.addEventListener('pointerup', () => {
    if (state !== 'drag') return;
    if (dragStartY - pos.y > lift()) standUp();
    else fall(); // pas assez haut : il retombe
  });
}

export function update(room) {
  const { x, y } = room.pointer;

  // Taille selon le scroll : 0 en haut, 1 en bas
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  p = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
  size = lerp(MIN_SIZE, MAX_SIZE, p);
  const onBack = state === 'falling' || state === 'dos' || state === 'drag';
  cafard.style.width = `${onBack ? size * DOS_RATIO : size}px`;

  if (state === 'follow') {
    pos.x = lerp(pos.x, x, FOLLOW);
    pos.y = lerp(pos.y, y, FOLLOW);
    if (performance.now() > graceUntil && touchesMeuble(room)) fall();
  } else if (state === 'falling') {
    vy += GRAVITY;
    pos.y += vy;
    const floor = window.innerHeight - cafard.offsetHeight / 2;
    if (pos.y >= floor) {
      pos.y = floor;
      state = 'dos';
      cafard.style.pointerEvents = 'auto'; // on peut maintenant l'attraper
      cafard.style.cursor = 'grab';
    }
  } else if (state === 'dos') {
    // Reste posé en bas, même si sa taille change en scrollant
    pos.y = window.innerHeight - cafard.offsetHeight / 2;
  } else if (state === 'drag') {
    // Plus il est gros, plus il traîne derrière la souris
    const ease = lerp(DRAG_SMALL, DRAG_BIG, p);
    pos.x = lerp(pos.x, x, ease);
    pos.y = lerp(pos.y, y, ease);
  }

  // Sur le dos, il penche un peu selon la hauteur à laquelle on le soulève
  const tilt = state === 'drag' ? clamp((dragStartY - pos.y) / lift(), 0, 1) * -30 : 0;
  cafard.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${tilt}deg)`;
}

// Hauteur à soulever pour le relever : augmente avec sa taille
function lift() {
  return lerp(LIFT_SMALL, window.innerHeight * LIFT_BIG, p);
}

// Le cafard touche-t-il un meuble ?
function touchesMeuble(room) {
  const r = size * HITBOX;
  return room.meubles.some((m) => {
    const b = m.getBoundingClientRect();
    const px = clamp(pos.x, b.left, b.right);
    const py = clamp(pos.y, b.top, b.bottom);
    return distance(pos.x, pos.y, px, py) < r;
  });
}

function fall() {
  state = 'falling';
  vy = 0;
  cafard.src = 'cafard-dos.png';
  cafard.style.pointerEvents = 'none';
  cafard.style.cursor = '';
  // Navigation bloquée
  nav.style.pointerEvents = 'none';
  nav.style.opacity = '0.3';
}

function standUp() {
  state = 'follow';
  graceUntil = performance.now() + GRACE;
  cafard.src = 'cafard.webp';
  cafard.style.pointerEvents = 'none';
  cafard.style.cursor = '';
  // Navigation débloquée
  nav.style.pointerEvents = '';
  nav.style.opacity = '';
}
