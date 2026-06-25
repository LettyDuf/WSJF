import { describe, it, expect } from 'vitest';
import { construireMarkdownJira } from '../../src/ui/formats/formatJiraMarkdown';
import { construireExportExhaustif } from '../../src/ui/formats/formatExhaustifMarkdown';
import { uneInitiative } from '../domain/helpers';
import {
  Initiative, EchelleFibonacci, QualificationSousCritere,
  NiveauConfiance, DecisionPriorisation,
} from '../../src/domain';

function initiativeRiche() {
  return Initiative.creer({
    id: 'init-test',
    nom: 'Refonte ouverture compte mobile',
    domaine: 'Acquisition',
    elementRepere: 'Repère X (5/3/5/3)',
    resultatAttendu: 'Réduire le taux d\'abandon de 40 %.',
    valeur: EchelleFibonacci.depuis(8),
    temps: EchelleFibonacci.depuis(5),
    risque: EchelleFibonacci.depuis(3),
    taille: EchelleFibonacci.depuis(5),
    preuves: {
      valeur: 'Étude utilisateurs menée en mars.',
      temps: 'Campagne d\'automne.',
      risque: 'Faible risque conformité.',
      taille: '3 équipes concernées.',
    },
    facteursTaille: new Set(),
    qualifications: {
      valeur: new Map([
        ['A', QualificationSousCritere.depuis('Fort')],
        ['B', QualificationSousCritere.depuis('Fort')],
        ['C', QualificationSousCritere.depuis('Moyen')],
        ['D', QualificationSousCritere.depuis('Moyen')],
      ]),
      temps: new Map([['D', QualificationSousCritere.depuis('Faible')]]),
      risque: new Map([
        ['A', QualificationSousCritere.depuis('Faible')],
        ['E', QualificationSousCritere.depuis('Faible')],
      ]),
      taille: new Map(),
    },
    qualiteDecision: {
      confiance: NiveauConfiance.depuis('Moyen'),
      decision: DecisionPriorisation.depuis('Planifier'),
      arbitrage: 'Après la version actuelle (T3).',
    },
    dateCreation: new Date('2026-06-01T00:00:00Z'),
  });
}

describe('Format Markdown Jira (hybride)', () => {
  it('contient le titre, la note WSJF et la décision', () => {
    const md = construireMarkdownJira(initiativeRiche());
    expect(md).toMatch(/^# Refonte ouverture compte mobile/m);
    expect(md).toMatch(/Note WSJF/);
    expect(md).toMatch(/Planifier/);
    expect(md).toMatch(/Confiance/);
  });

  it('regroupe les signaux Fort et Faible séparément', () => {
    const md = construireMarkdownJira(initiativeRiche());
    expect(md).toMatch(/signal\(aux\) Fort/);
    expect(md).toMatch(/signal\(aux\) Faible/);
  });

  it('résume le nombre de sous-critères Moyen sans les détailler', () => {
    const md = construireMarkdownJira(initiativeRiche());
    expect(md).toMatch(/sous-critère\(s\) qualifié\(s\) Moyen/);
    // Les sous-critères Moyen ne sont pas listés individuellement
    expect(md.split('\n').filter((l) => l.includes('· C. Confort')).length).toBe(0);
  });

  it("inclut l'arbitrage explicite quand présent", () => {
    const md = construireMarkdownJira(initiativeRiche());
    expect(md).toMatch(/## Arbitrage/);
    expect(md).toMatch(/T3/);
  });

  it("renvoie un Markdown utilisable même quand seuls les composantes sont saisies", () => {
    const md = construireMarkdownJira(uneInitiative({ nom: 'Mini' }));
    expect(md).toMatch(/# Mini/);
    expect(md).toMatch(/\| Valeur \| Temps \|/);
  });
});

describe('Format Markdown exhaustif', () => {
  it('contient toutes les composantes et tous les sous-critères', () => {
    const md = construireExportExhaustif(initiativeRiche());
    expect(md).toMatch(/## Valeur utilisateur-métier/);
    expect(md).toMatch(/## Sensibilité au temps/);
    expect(md).toMatch(/## Réduction du risque/);
    expect(md).toMatch(/## Taille du travail/);
    // Sous-critères : tous les A, B, C, D... présents avec leur qualification
    expect(md).toMatch(/\*\*A\.\*\*/);
    expect(md).toMatch(/Non qualifié/); // Pour les sous-critères non saisis
  });

  it('inclut les notes libres saisies pendant le pointage', () => {
    const md = construireExportExhaustif(initiativeRiche());
    expect(md).toMatch(/Étude utilisateurs/);
    expect(md).toMatch(/Campagne d/);
    expect(md).toMatch(/3 équipes/);
  });

  it('inclut les métadonnées et les deux notes (WSJF + pondérée)', () => {
    const md = construireExportExhaustif(initiativeRiche());
    expect(md).toMatch(/ID interne/);
    expect(md).toMatch(/Date d'export/);
    expect(md).toMatch(/Note WSJF \(officielle\)/);
    expect(md).toMatch(/Note pondérée/);
  });

  it("inclut l'arbitrage explicite", () => {
    const md = construireExportExhaustif(initiativeRiche());
    expect(md).toMatch(/### Arbitrage explicite retenu/);
    expect(md).toMatch(/T3/);
  });
});
