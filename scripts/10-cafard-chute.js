// =============================================================================
// 10-cafard-chute.js
// Le cafard suit la souris. S'il se cogne contre un meuble, il tombe en bas
// de l'écran, sur le dos. Pour le relever : le cliquer et le glisser vers le haut.
// Tant qu'il est sur le dos, la navigation entre les pages est bloquée.
// =============================================================================

import { lerp, clamp, distance } from './_utils.js';

export const usesPages = true; // affiche la navigation entre les pages

// --- RÉGLAGES -----------------------------------------------------------------
const FOLLOW = 0.12;       // 1 = collé au pointeur, plus petit = traîne derrière
const SIZE = 80;           // largeur du cafard debout (px)
const SIZE_DOS = 120;      // largeur du cafard sur le dos (px)
const HITBOX = 0.35;       // rayon de collision = SIZE × HITBOX
const GRAVITY = 0.8;       // vitesse de chute
const LIFT = 100;          // distance à glisser vers le haut pour le relever (px)
const GRACE = 800;         // après l'avoir relevé, ms pendant lesquelles il ne peut pas retomber
// -----------------------------------------------------------------------------

let cafard;
let nav;
let state = 'wait';        // 'wait' | 'follow' | 'falling' | 'dos' | 'drag'
let vy = 0;                // vitesse de chute
let dragStartY = 0;
let graceUntil = 0;
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
    width: `${SIZE}px`,
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
    dragStartY = e.clientY;
    cafard.style.cursor = 'grabbing';
  });

  // ...et relâcher assez haut
  window.addEventListener('pointerup', (e) => {
    if (state !== 'drag') return;
    if (dragStartY - e.clientY > LIFT) standUp();
    else fall(); // pas assez haut : il retombe
  });
}

export function update(room) {
  const { x, y } = room.pointer;

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
  } else if (state === 'drag') {
    pos.x = x;
    pos.y = y;
  }

  // Sur le dos, il penche un peu selon la hauteur à laquelle on le soulève
  const tilt = state === 'drag' ? clamp((dragStartY - y) / LIFT, 0, 1) * -30 : 0;
  cafard.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${tilt}deg)`;
}

// Le cafard touche-t-il un meuble ?
function touchesMeuble(room) {
  const r = SIZE * HITBOX;
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
  cafard.style.width = `${SIZE_DOS}px`;
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
  cafard.style.width = `${SIZE}px`;
  cafard.style.pointerEvents = 'none';
  cafard.style.cursor = '';
  // Navigation débloquée
  nav.style.pointerEvents = '';
  nav.style.opacity = '';
}
