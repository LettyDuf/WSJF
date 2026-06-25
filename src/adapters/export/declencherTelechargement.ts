/**
 * Utilitaire commun aux exporteurs : déclenche un téléchargement
 * navigateur à partir d'un Blob.
 *
 * Isolé dans une fonction pour pouvoir être mocké dans les tests
 * (les exporteurs eux-mêmes restent testables en vérifiant le Blob produit).
 */

export function declencherTelechargement(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Libération différée pour laisser le navigateur consommer l'URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
