import { describe, it, expect, beforeEach } from 'vitest';
import { ToastNotificateur } from '../../src/adapters/notification/ToastNotificateur';

describe('ToastNotificateur', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('crée un conteneur unique avec ARIA accessible', () => {
    const t = new ToastNotificateur();
    t.notifier('succes', 'Sauvegarde effectuée');
    const c = document.getElementById('wsjf-toasts');
    expect(c).not.toBeNull();
    expect(c?.getAttribute('role')).toBe('status');
    expect(c?.getAttribute('aria-live')).toBe('polite');
  });

  it('ajoute un toast avec la classe correspondant au type', () => {
    const t = new ToastNotificateur();
    t.notifier('erreur', 'Échec import');
    const toast = document.querySelector('.wsjf-toast');
    expect(toast).not.toBeNull();
    expect(toast?.classList.contains('wsjf-toast--erreur')).toBe(true);
    expect(toast?.textContent).toBe('Échec import');
  });

  it('réutilise le même conteneur pour plusieurs messages', () => {
    const t = new ToastNotificateur();
    t.notifier('info', 'message 1');
    t.notifier('avertissement', 'message 2');
    const conteneurs = document.querySelectorAll('#wsjf-toasts');
    expect(conteneurs).toHaveLength(1);
    expect(conteneurs[0]?.children).toHaveLength(2);
  });
});
