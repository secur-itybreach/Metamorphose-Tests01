# Instructions pour les agents — banc d'essai « La chambre de Gregor »

Ce dossier est un banc d'essai d'interactions web pour un site sur La Métamorphose de Kafka,
centré sur la chambre de Gregor (perte d'identité et de capacité). Ton rôle : transformer une
idée d'interaction donnée par l'utilisateur en un nouveau test, en ne créant qu'un seul fichier
JavaScript.

## Avant de commencer, lis

- `index.html` : la chambre, avec ses meubles et ses textes
- `style.css` : la mise en page de base
- `scripts/_main.js` : ce qui charge les tests
- `scripts/_utils.js` : les fonctions partagées
- `scripts/00-template.js` : le modèle commenté de test
- deux ou trois tests existants, pour reprendre le même style

## Règles

- Ne modifie PAS `index.html`, `style.css`, `_main.js` ni `_utils.js`. Seule exception :
  ajouter le nom du nouveau test dans le tableau `TESTS` en haut de `_main.js`.
- Un test = un fichier `scripts/NN-nom-court.js`, en continuant la numérotation existante.
- HTML, CSS et JavaScript vanilla, modules ES. Pas de dépendances, pas de build.
  Le projet est lancé avec Live Server.
- Doit fonctionner sur desktop et mobile (souris et tactile).
- Fais au plus simple. Commentaires en français, comme dans les autres fichiers.
- Ne modifie pas les autres tests : ce sont des essais archivés. Pour combiner des tests,
  importe-les (voir `09-solides-ecrasement-pages.js`).

## Ce que reçoit un test (l'objet `room`)

- `room.el` : la grille `<main class="room">`, à zones nommées (`grid-template-areas`)
- `room.meubles` / `room.meuble.<id>` : les 6 meubles (cadre, armoire, bureau, chaise, lit, commode)
  - chacun a un `data-memory` (un souvenir de Gregor) et un conteneur `.meuble-svg`
- `room.textes` / `room.texte['texte-1']` : les 4 blocs de texte
- `room.memory` : une bulle de texte, cachée, que l'on affiche avec la classe `.is-visible`
- `room.pointer` : `{ x, y, isDown }` en coordonnées de la fenêtre, souris et tactile unifiés
- `room.page` et `room.progress` (0 sur la première page → 1 sur la dernière) : seulement si le
  test exporte `export const usesPages = true;`, ce qui affiche la navigation entre pages

## Structure d'un test

- `export function setup(room)` : appelée une fois au chargement
- `export function update(room)` : appelée à chaque frame
- Les réglages sont des constantes en majuscules en haut du fichier, avec un commentaire.
- Le test modifie l'apparence en JS (`el.style`, `classList`) ou crée ses propres éléments
  (`document.createElement`). Images disponibles à la racine : `cafard.webp` et `cafard-dos.png`.

## Pièges déjà rencontrés (à éviter)

- Effet piloté par le scroll qui change la hauteur de la page : la progression se dérègle et la
  page saute.
  → Calculer la progression sur une distance de scroll fixe, définir `document.body.style.minHeight`
    et désactiver le recalage du scroll avec `overflowAnchor = 'none'`.
- Recalculer toute la mise en page à chaque frame provoque des saccades.
  → Avancer de façon incrémentale, avec un lissage (`lerp`).
- Collisions et poussées :
  - pointeur pile au centre d'un élément : la direction de poussée vaut zéro, prévoir un cas
    par défaut ;
  - deux bords à égale distance : l'élément oscille, mémoriser le côté choisi.
- Pointeur à (0, 0) avant le premier mouvement de souris : attendre le premier `pointermove`.
- Image qu'on attrape à la souris : mettre `draggable = false` et `touch-action: none`.
- Éléments déplacés par `transform` : ajouter `overflow: 'clip'` sur la chambre pour éviter un
  scroll horizontal.
- Contraintes à respecter sauf demande contraire :
  - le texte reste lisible (largeur minimale d'environ 12em) ;
  - pas de superposition entre éléments ;
  - rien ne sort de l'écran.

## Quand tu as fini

- Vérifie la syntaxe avec : `node --check --input-type=module < scripts/NN-nom.js`
- Si tu peux, ouvre `index.html?test=NN-nom` (et `&page=4` pour un test sur plusieurs pages).
  Teste en desktop et en mobile.
- Explique en quelques lignes ce que fait le test, les réglages disponibles et ses limites.
  Dis clairement ce que tu as vérifié et ce que tu n'as pas pu vérifier.
