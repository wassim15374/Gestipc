/**
 * Génère une référence lisible de type PREFIXE-ANNEE-XXXX à partir
 * du nombre d'enregistrements déjà existants (compteur séquentiel).
 * Exemple : CMD-2026-0007, FAC-2026-0042.
 */
const genererReference = (prefixe, compteur) => {
  const annee = new Date().getFullYear();
  const numero = String(compteur + 1).padStart(4, '0');
  return `${prefixe}-${annee}-${numero}`;
};

module.exports = { genererReference };
