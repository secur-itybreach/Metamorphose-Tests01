// =============================================================================
// 01-demo.js — démonstration
// Au survol (ou au toucher) d'un meuble, son souvenir apparaît près du pointeur.
// =============================================================================

export function setup(room) {
  room.meubles.forEach((meuble) => {
    meuble.addEventListener('pointerenter', () => {
      room.memory.textContent = meuble.dataset.memory;
      room.memory.classList.add('is-visible');
    });
    meuble.addEventListener('pointerleave', () => {
      room.memory.classList.remove('is-visible');
    });
  });
}

export function update(room) {
  // La bulle suit le pointeur
  room.memory.style.left = `${room.pointer.x + 12}px`;
  room.memory.style.top = `${room.pointer.y + 12}px`;
}
