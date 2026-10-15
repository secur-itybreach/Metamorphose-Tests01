// =============================================================================
// 00-template.js — modèle à dupliquer pour un nouveau test
//
// 1. Dupliquer ce fichier : scripts/02-mon-test.js
// 2. Ajouter '02-mon-test' dans TESTS en haut de _main.js
// 3. Ouvrir index.html?test=02-mon-test
//
// Un test exporte deux fonctions (facultatives) :
//   setup(room)  → appelée une fois au chargement
//   update(room) → appelée à chaque frame (~60 fois par seconde)
//
// Navigation entre les pages (facultative) : ajouter
//   export const usesPages = true;
// puis utiliser room.page (0 = première) ou room.progress (0 → 1 sur la dernière)
// =============================================================================

import { lerp, clamp, map, distance, getRect, isColliding, setVar } from './_utils.js';


export function setup(room) {
  // Vérification : tout est bien branché (voir la console)
  console.log('room', room);

  // --- CE QU'ON PEUT FAIRE FACILEMENT ---------------------------------------

  // Sélectionner un élément
  // room.meuble.lit, room.texte['texte-1']
  // room.meubles.forEach((m) => { ... });

  // Lire le souvenir d'un meuble
  // room.meuble.bureau.dataset.memory

  // Afficher / cacher un élément
  // room.texte['texte-2'].classList.add('is-hidden');

  // Modifier le style directement
  // room.meuble.lit.style.background = 'black';
  // room.texte['texte-2'].style.transform = 'translate(40px, -20px) rotate(-3deg)';

  // Réorganiser la chambre (zones nommées de la grille)
  // room.el.style.gridTemplateAreas = `
  //   "lit     lit     lit     armoire armoire armoire"
  //   "texte-1 texte-1 texte-1 armoire armoire armoire"
  //   "bureau  bureau  chaise  texte-2 texte-2 .      "
  //   "bureau  bureau  chaise  cadre   cadre   cadre  "
  //   "texte-3 texte-3 .       cadre   cadre   cadre  "
  //   "commode commode commode texte-4 texte-4 .      "`;

  // Bulle de souvenir
  // room.memory.textContent = room.meuble.lit.dataset.memory;
  // room.memory.classList.add('is-visible');

  // Réagir au survol / clic
  // room.meuble.armoire.addEventListener('pointerenter', () => { ... });
  // room.meuble.armoire.addEventListener('click', () => { ... });

  // Remplir le conteneur SVG d'un meuble
  // document.getElementById('chaise-svg').innerHTML = '<svg viewBox="0 0 100 100">...</svg>';
}


export function update(room) {
  // Ce qui doit être recalculé en continu :
  // room.pointer.x, room.pointer.y, room.pointer.isDown

  // const r = getRect(room.meuble.lit);
  // const d = distance(room.pointer.x, room.pointer.y, r.cx, r.cy);
  // room.meuble.lit.style.opacity = map(d, 0, 500, 0.2, 1, true);

  // if (isColliding(room.texte['texte-1'], room.meuble.armoire)) { ... }
}
