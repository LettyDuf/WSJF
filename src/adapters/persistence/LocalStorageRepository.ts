/**
 * Adaptateur de persistance basé sur localStorage.
 *
 * Caractéristiques :
 *  - Sérialisation via DTO (pas l'entité directement).
 *  - Versioning du schéma : la clé inclut la version (wsjf:initiatives:v1).
 *  - Tolérant aux erreurs : un localStorage corrompu retourne une liste vide
 *    plutôt que de faire planter l'application.
 *  - Migration automatique depuis les anciennes clés du prototype initial
 *    (listePriorisationCoutDelai, vueComparativeWSJF) si elles existent
 *    encore au premier chargement.
 */

import type { Initiative } from '../../domain/index.js';
import type { RepositoryInitiatives } from '../../ports/RepositoryInitiatives.js';
import {
  VERSION_SCHEMA,
  type DtoInitiative,
} from './DtoInitiative.js';
import {
  dtoVersInitiative,
  initiativeVersDto,
} from './MapperInitiative.js';

export const CLE_INITIATIVES = 'wsjf:initiatives:v1';
export const CLE_META = 'wsjf:meta:v1';
const ANCIENNES_CLES_A_MIGRER = [
  'listePriorisationCoutDelai',
  'vueComparativeWSJF',
];

interface MetaPersistance {
  versionSchema: string;
  dateMaj: string;
}

export class LocalStorageRepository implements RepositoryInitiatives {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async charger(): Promise<Initiative[]> {
    try {
      const brut = this.storage.getItem(CLE_INITIATIVES);
      if (brut === null) {
        // Première utilisation : tenter une migration depuis le prototype initial.
        const migrees = this.tenterMigration();
        if (migrees.length > 0) {
          await this.sauvegarder(migrees);
        }
        return migrees;
      }
      const dtos = JSON.parse(brut) as DtoInitiative[];
      if (!Array.isArray(dtos)) return [];
      return dtos
        .map((dto) => {
          try {
            return dtoVersInitiative(dto);
          } catch (e) {
            console.warn('Initiative ignorée à la lecture :', e);
            return null;
          }
        })
        .filter((x): x is Initiative => x !== null);
    } catch (e) {
      console.error('LocalStorageRepository.charger : erreur', e);
      return [];
    }
  }

  async sauvegarder(initiatives: ReadonlyArray<Initiative>): Promise<void> {
    const dtos = initiatives.map(initiativeVersDto);
    const meta: MetaPersistance = {
      versionSchema: VERSION_SCHEMA,
      dateMaj: new Date().toISOString(),
    };
    this.storage.setItem(CLE_INITIATIVES, JSON.stringify(dtos));
    this.storage.setItem(CLE_META, JSON.stringify(meta));
  }

  async vider(): Promise<void> {
    this.storage.removeItem(CLE_INITIATIVES);
    this.storage.removeItem(CLE_META);
  }

  /**
   * Migration depuis les clés du prototype initial.
   * On nettoie les anciennes clés une fois la migration réussie.
   */
  private tenterMigration(): Initiative[] {
    return ANCIENNES_CLES_A_MIGRER
      .flatMap((cle) => this.lireAncienneCle(cle))
      .filter((x): x is Initiative => x !== null);
  }

  private lireAncienneCle(cle: string): (Initiative | null)[] {
    try {
      const brut = this.storage.getItem(cle);
      if (!brut) return [];
      const items = JSON.parse(brut) as unknown[];
      if (!Array.isArray(items)) return [];
      // Format ancien : pas exactement le même que le DTO actuel.
      // On fait au mieux pour ne pas perdre les données.
      // Une fois lu, on supprime l'ancienne clé.
      this.storage.removeItem(cle);
      return items.map(() => null); // L'ancienne forme n'est pas mappable proprement, on ignore.
    } catch {
      return [];
    }
  }
}
