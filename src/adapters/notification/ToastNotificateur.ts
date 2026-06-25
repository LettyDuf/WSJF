/**
 * Adaptateur de notification éphémère (toast).
 *
 * Crée un conteneur unique en bas-droite de la page, y empile les messages,
 * les fait disparaître après quelques secondes. Aucune dépendance externe.
 *
 * Accessibilité : conteneur avec role="status" et aria-live="polite" pour
 * que les lecteurs d'écran annoncent les messages.
 */

import type {
  NotificateurUtilisateur,
  TypeNotification,
} from '../../ports/NotificateurUtilisateur.js';

const ID_CONTENEUR = 'wsjf-toasts';
const DUREE_MS = 3500;

export class ToastNotificateur implements NotificateurUtilisateur {
  notifier(type: TypeNotification, message: string): void {
    const conteneur = this.obtenirOuCreerConteneur();
    const toast = document.createElement('div');
    toast.className = `wsjf-toast wsjf-toast--${type}`;
    toast.textContent = message;
    conteneur.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('wsjf-toast--sortie');
      setTimeout(() => toast.remove(), 250);
    }, DUREE_MS);
  }

  private obtenirOuCreerConteneur(): HTMLElement {
    let c = document.getElementById(ID_CONTENEUR);
    if (c) return c;
    c = document.createElement('div');
    c.id = ID_CONTENEUR;
    c.setAttribute('role', 'status');
    c.setAttribute('aria-live', 'polite');
    document.body.appendChild(c);
    return c;
  }
}
