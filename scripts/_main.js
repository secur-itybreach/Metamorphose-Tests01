// =============================================================================
// _main.js — charge le test choisi et prépare l'objet `room`
//
// index.html?test=01-demo  → importe scripts/01-demo.js
// index.html               → affiche le menu des tests
// =============================================================================

// Liste des tests affichés dans le menu (nom du fichier sans .js)
const TESTS = [
  '00-template',
  '01-demo',
  '02-ecrasement',
  '03-cafard',
  '04-retrecissement',
  '05-ecrasement-pages',
  '06-cafard-pages',
  '07-retrecissement-pages',
  '08-meubles-solides',
  '09-solides-ecrasement-pages',
  '10-cafard-chute',
];

// Nombre de pages : la navigation en bas de page va de 1 à PAGE_COUNT
const PAGE_COUNT = 5;


// L'objet `room`, transmis à chaque test
const meubles = [...document.querySelectorAll('.meuble')];
const textes = [...document.querySelectorAll('.texte')];

const room = {
  el: document.getElementById('room'),           // la grille
  meubles,                                       // tableau de tous les .meuble
  textes,                                        // tableau de tous les .texte
  meuble: byId(meubles),                         // room.meuble.lit
  texte: byId(textes),                           // room.texte['texte-1']
  memory: document.querySelector('.memory-bubble'),
  pointer: { x: 0, y: 0, isDown: false },        // souris et tactile, coordonnées de la fenêtre
  page: 0,                                       // page actuelle (0 = première), lue dans l'URL
  pageCount: PAGE_COUNT,
  progress: 0,                                   // 0 sur la première page → 1 sur la dernière
};

// [<div id="lit">, ...] → { lit: <div>, ... }
function byId(list) {
  return Object.fromEntries(list.map((el) => [el.id, el]));
}


// Pointeur (les pointer events gèrent souris et tactile)
window.addEventListener('pointermove', (e) => {
  room.pointer.x = e.clientX;
  room.pointer.y = e.clientY;
});

window.addEventListener('pointerdown', (e) => {
  room.pointer.x = e.clientX;
  room.pointer.y = e.clientY;
  room.pointer.isDown = true;
});

window.addEventListener('pointerup', () => (room.pointer.isDown = false));
window.addEventListener('pointercancel', () => (room.pointer.isDown = false)); // scroll au doigt


// Chargement du test et de la page : index.html?test=05-ecrasement-pages&page=2
const params = new URLSearchParams(location.search);
const testName = params.get('test');
room.page = Math.min(Math.max(parseInt(params.get('page'), 10) || 0, 0), PAGE_COUNT - 1);
room.progress = room.page / (PAGE_COUNT - 1);

if (testName) {
  loadTest(testName);
} else {
  showMenu();
}

async function loadTest(name) {
  const label = document.getElementById('test-label');
  label.textContent = `${name} ↩`;
  label.classList.remove('is-hidden');

  const test = await import(`./${name}.js`);

  // Navigation entre les pages, seulement pour les tests qui l'utilisent
  // (ils exportent : export const usesPages = true;)
  if (test.usesPages) showPageNav(name);

  // setup(room) : une fois au chargement
  if (test.setup) test.setup(room);

  // update(room) : à chaque frame
  if (test.update) {
    const loop = () => {
      test.update(room);
      requestAnimationFrame(loop);
    };
    loop();
  }

  window.room = room; // accessible dans la console
}

// Navigation en bas de page : précédente · suivante
function showPageNav(name) {
  const nav = document.getElementById('page-nav');
  const link = (page, text) => `<a href="?test=${name}&page=${page}">${text}</a>`;
  nav.innerHTML =
    (room.page > 0 ? link(room.page - 1, '← page précédente') : '<span></span>') +
    (room.page < PAGE_COUNT - 1 ? link(room.page + 1, 'page suivante →') : '<span></span>');
  nav.classList.remove('is-hidden');
}

function showMenu() {
  const menu = document.getElementById('test-menu');
  menu.innerHTML = '<ul>' + TESTS.map((name) => `<li><a href="?test=${name}">${name}</a></li>`).join('') + '</ul>';
  menu.classList.remove('is-hidden');
}
