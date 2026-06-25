/**
 * Adaptateur du presse-papier basé sur l'API Clipboard.
 * Gère le cas où l'API n'est pas disponible (contextes non sécurisés,
 * navigateurs anciens) sans crasher.
 */

import type { PressePapier } from '../../ports/PressePapier.js';

export class ClipboardAdapter implements PressePapier {
  async ecrire(texte: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(texte);
      return true;
    } catch {
      return false;
    }
  }
}
