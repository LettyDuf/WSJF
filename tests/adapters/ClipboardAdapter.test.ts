import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClipboardAdapter } from '../../src/adapters/notification/ClipboardAdapter';

describe('ClipboardAdapter', () => {
  let origClipboard: typeof navigator.clipboard | undefined;

  beforeEach(() => {
    origClipboard = navigator.clipboard;
  });

  afterEach(() => {
    if (origClipboard !== undefined) {
      Object.defineProperty(navigator, 'clipboard', {
        value: origClipboard,
        configurable: true,
      });
    }
  });

  it('retourne true quand writeText réussit', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    const a = new ClipboardAdapter();
    expect(await a.ecrire('coucou')).toBe(true);
  });

  it('retourne false quand writeText échoue', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('no perm')) },
      configurable: true,
    });
    const a = new ClipboardAdapter();
    expect(await a.ecrire('coucou')).toBe(false);
  });

  it('retourne false quand navigator.clipboard est absent', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    const a = new ClipboardAdapter();
    expect(await a.ecrire('coucou')).toBe(false);
  });
});
