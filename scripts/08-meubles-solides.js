// =============================================================================
// 08-meubles-solides.js
// Les meubles deviennent solides : le cafard suit la souris mais ne peut ni
// les traverser ni les pousser. Il s'arrête contre eux et glisse le long des bords.
// =============================================================================

import { lerp, clamp, distance } from './_utils.js';

// --- RÉGLAGES -----------------------------------------------------------------
const HIDE_CURSOR = false; // true : le cafard remplace la souris
                          // false : la souris reste visible, le cafard la suit
const FOLLOW = HIDE_CURSOR ? 1 : 0.08; // 1 = collé au pointeur, plus petit = traîne derrière
const SIZE = 80;          // taille du cafard (px)
const HITBOX = 0.35;      // rayon de collision = SIZE × HITBOX
// -----------------------------------------------------------------------------

let cafard;
const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // position du cafard

export function setup(room) {
  if (HIDE_CURSOR) document.documentElement.style.cursor = 'none';

  cafard = document.createElement('img');
  cafard.src = 'cafard.webp';
  cafard.alt = '';
  Object.assign(cafard.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${SIZE}px`,
    pointerEvents: 'none',
    zIndex: '1000',
  });
  document.body.append(cafard);

  // Départ : le cafard apparaît là où se trouve le pointeur au premier mouvement
  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    pushOut(room);
  }, { once: true });
}

export function update(room) {
  // Point visé : le pointeur, ou un peu derrière si FOLLOW < 1
  const tx = lerp(pos.x, room.pointer.x, FOLLOW);
  const ty = lerp(pos.y, room.pointer.y, FOLLOW);

  // On avance par petits pas pour ne jamais sauter par-dessus un meuble
  const steps = Math.min(50, Math.ceil(distance(pos.x, pos.y, tx, ty) / 4));
  const dx = (tx - pos.x) / steps;
  const dy = (ty - pos.y) / steps;
  for (let i = 0; i < steps; i++) {
    pos.x += dx;
    pos.y += dy;
    pushOut(room);
  }
  // Même immobile, le cafard est repoussé si un meuble arrive sur lui (scroll)
  if (steps === 0) pushOut(room);

  cafard.style.transform = `translate(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px)`;
}

// Sort le cafard des meubles et le garde dans l'écran
function pushOut(room) {
  const r = SIZE * HITBOX;

  room.meubles.forEach((m) => {
    const b = m.getBoundingClientRect();

    // Point du meuble le plus proche du cafard
    const px = clamp(pos.x, b.left, b.right);
    const py = clamp(pos.y, b.top, b.bottom);
    const d = distance(pos.x, pos.y, px, py);

    if (d > 0 && d < r) {
      // Cafard contre le bord : on le recule jusqu'à toucher sans entrer
      pos.x = px + ((pos.x - px) / d) * r;
      pos.y = py + ((pos.y - py) / d) * r;
    } else if (d === 0) {
      // Centre du cafard dans le meuble : on le sort par le bord le plus proche
      const exits = [
        { d: pos.x - b.left, x: b.left - r, y: pos.y },
        { d: b.right - pos.x, x: b.right + r, y: pos.y },
        { d: pos.y - b.top, x: pos.x, y: b.top - r },
        { d: b.bottom - pos.y, x: pos.x, y: b.bottom + r },
      ];
      const exit = exits.reduce((a, c) => (c.d < a.d ? c : a));
      pos.x = exit.x;
      pos.y = exit.y;
    }
  });

  // Reste dans l'écran
  pos.x = clamp(pos.x, r, window.innerWidth - r);
  pos.y = clamp(pos.y, r, window.innerHeight - r);
}
