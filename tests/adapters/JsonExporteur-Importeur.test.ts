import { describe, it, expect } from 'vitest';
import { JsonExporteur } from '../../src/adapters/export/JsonExporteur';
import { JsonImporteur } from '../../src/adapters/import/JsonImporteur';
import { uneInitiative } from '../domain/helpers';

describe('JSON export/import round-trip', () => {
  it("exporte puis réimporte une liste à l'identique", () => {
    const exp = new JsonExporteur();
    const imp = new JsonImporteur();
    const initiatives = [
      uneInitiative({ nom: 'Auth unifiée', valeur: 13, temps: 8, risque: 5, taille: 3, confiance: 'Élevé' }),
      uneInitiative({ nom: 'Migration paiement', valeur: 8, temps: 5, risque: 13, taille: 13, confiance: 'Faible' }),
    ];
    const texte = exp.construireTexte(initiatives);
    const resultat = imp.depuisTexte(texte);

    expect(resultat.erreurs).toEqual([]);
    expect(resultat.versionSchemaDetectee).toBe('2.0.0');
    expect(resultat.initiatives).toHaveLength(2);
    expect(resultat.initiatives[0]?.nom()).toBe('Auth unifiée');
    expect(resultat.initiatives[0]?.valeur()?.valeur()).toBe(13);
    expect(resultat.initiatives[1]?.qualiteDecision().confiance.libelle()).toBe('Faible');
  });

  it('rapporte une erreur sur JSON malformé', () => {
    const imp = new JsonImporteur();
    const r = imp.depuisTexte('{ pas json');
    expect(r.erreurs.length).toBeGreaterThan(0);
    expect(r.erreurs[0]?.message).toMatch(/JSON invalide/);
  });

  it('rapporte une erreur sur structure inattendue', () => {
    const imp = new JsonImporteur();
    const r = imp.depuisTexte(JSON.stringify({ versionSchema: '2.0.0' }));
    expect(r.erreurs[0]?.message).toMatch(/initiatives/);
  });

  it('isole les DTO invalides ligne par ligne', () => {
    const imp = new JsonImporteur();
    const contenu = {
      versionSchema: '2.0.0',
      dateExport: new Date().toISOString(),
      initiatives: [
        { id: 'a', nom: 'OK', domaine: 'D', elementRepere: '', resultatAttendu: '',
          valeur: 5, temps: 5, risque: 5, taille: 5,
          preuveValeur: '', preuveTemps: '', preuveRisque: '', preuveTaille: '',
          facteursTaille: [], confiance: 'Moyen', decision: 'À arbitrer',
          responsable: '', arbitrage: '', dateCreation: new Date().toISOString() },
        { id: 'b', nom: 'KO', domaine: 'D', elementRepere: '', resultatAttendu: '',
          valeur: 7, temps: 5, risque: 5, taille: 5,
          preuveValeur: '', preuveTemps: '', preuveRisque: '', preuveTaille: '',
          facteursTaille: [], confiance: 'Moyen', decision: 'À arbitrer',
          responsable: '', arbitrage: '', dateCreation: new Date().toISOString() },
      ],
    };
    const r = imp.depuisTexte(JSON.stringify(contenu));
    expect(r.initiatives).toHaveLength(1);
    expect(r.initiatives[0]?.nom()).toBe('OK');
    expect(r.erreurs).toHaveLength(1);
    expect(r.erreurs[0]?.ligne).toBe(2);
    expect(r.erreurs[0]?.message).toMatch(/Fibonacci/);
  });
});
