// =============================================================================
// 09-solides-ecrasement-pages.js
// Combine deux tests existants :
// - 05-ecrasement-pages : les meubles grandissent de page en page
// - 08-meubles-solides  : le cafard ne peut ni traverser ni pousser les meubles
// Plus les meubles grandissent, moins le cafard a de place pour circuler.
//
// Les réglages se font dans les deux fichiers d'origine
// (ex. HIDE_CURSOR et FOLLOW dans 08-meubles-solides.js).
// =============================================================================

import * as ecrasement from './05-ecrasement-pages.js';
import * as solides from './08-meubles-solides.js';

export const usesPages = true; // affiche la navigation entre les pages

export function setup(room) {
  ecrasement.setup(room);
  solides.setup(room);
}

export function update(room) {
  ecrasement.update(room); // d'abord les meubles grandissent...
  solides.update(room);    // ...puis le cafard est repoussé s'il se retrouve dedans
}
