/**
 * Port : notification éphémère affichée à l'utilisateur.
 * Implémentation type : toast non bloquant.
 */

export type TypeNotification = 'succes' | 'info' | 'avertissement' | 'erreur';

export interface NotificateurUtilisateur {
  notifier(type: TypeNotification, message: string): void;
}
