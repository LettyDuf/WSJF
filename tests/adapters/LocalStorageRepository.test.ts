import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageRepository, CLE_INITIATIVES, CLE_META } from '../../src/adapters/persistence/LocalStorageRepository';
import { uneInitiative } from '../domain/helpers';

class StorageEnMemoire implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(k: string): string | null { return this.data.get(k) ?? null; }
  setItem(k: string, v: string): void { this.data.set(k, v); }
  removeItem(k: string): void { this.data.delete(k); }
  key(i: number): string | null { return Array.from(this.data.keys())[i] ?? null; }
}

describe('LocalStorageRepository', () => {
  let storage: StorageEnMemoire;
  let repo: LocalStorageRepository;

  beforeEach(() => {
    storage = new StorageEnMemoire();
    repo = new LocalStorageRepository(storage);
  });

  it('charge une liste vide quand rien n\'est stocké', async () => {
    expect(await repo.charger()).toEqual([]);
  });

  it('sauvegarde puis recharge une initiative à l\'identique', async () => {
    const init = uneInitiative({ nom: 'Test Round Trip', valeur: 8, temps: 5, risque: 3, taille: 2 });
    await repo.sauvegarder([init]);
    const chargees = await repo.charger();
    expect(chargees).toHaveLength(1);
    expect(chargees[0]?.nom()).toBe('Test Round Trip');
    expect(chargees[0]?.valeur()?.valeur()).toBe(8);
    expect(chargees[0]?.taille()?.valeur()).toBe(2);
  });

  it('persiste la version du schéma dans les métadonnées', async () => {
    await repo.sauvegarder([uneInitiative()]);
    const meta = JSON.parse(storage.getItem(CLE_META) ?? '{}');
    expect(meta.versionSchema).toBe('2.0.0');
    expect(meta.dateMaj).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('vide supprime les deux clés', async () => {
    await repo.sauvegarder([uneInitiative()]);
    await repo.vider();
    expect(storage.getItem(CLE_INITIATIVES)).toBeNull();
    expect(storage.getItem(CLE_META)).toBeNull();
  });

  it('retourne une liste vide si le contenu stocké est corrompu', async () => {
    storage.setItem(CLE_INITIATIVES, 'pas du json valide {');
    expect(await repo.charger()).toEqual([]);
  });

  it('ignore les initiatives DTO invalides à la lecture sans tout faire planter', async () => {
    const dtoValide = {
      id: 'a', nom: 'OK', domaine: 'D', elementRepere: '', resultatAttendu: '',
      valeur: 5, temps: 5, risque: 5, taille: 5,
      preuveValeur: '', preuveTemps: '', preuveRisque: '', preuveTaille: '',
      facteursTaille: [], confiance: 'Moyen', decision: 'À arbitrer',
      responsable: '', arbitrage: '', dateCreation: new Date().toISOString(),
    };
    const dtoInvalide = { ...dtoValide, confiance: 'NEXISTEPAS' };
    storage.setItem(CLE_INITIATIVES, JSON.stringify([dtoValide, dtoInvalide]));
    const chargees = await repo.charger();
    expect(chargees).toHaveLength(1);
    expect(chargees[0]?.nom()).toBe('OK');
  });

  it('nettoie les anciennes clés du prototype au premier chargement', async () => {
    storage.setItem('listePriorisationCoutDelai', JSON.stringify([{ foo: 'bar' }]));
    storage.setItem('vueComparativeWSJF', JSON.stringify([{ foo: 'baz' }]));
    await repo.charger();
    expect(storage.getItem('listePriorisationCoutDelai')).toBeNull();
    expect(storage.getItem('vueComparativeWSJF')).toBeNull();
  });
});
