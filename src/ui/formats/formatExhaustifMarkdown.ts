/**
 * Format Markdown exhaustif — pour archivage et trace de gouvernance.
 *
 * Contient :
 *  - Métadonnées complètes (id, dates)
 *  - Tous les sous-critères qualifiés détaillés
 *  - Toutes les notes libres saisies pendant le pointage
 *  - Note WSJF + note pondérée par confiance
 *  - Arbitrage explicite intégral
 */

import { CalculateurWsjf, catalogueDe } from '../../domain/index.js';
import type { Initiative } from '../../domain/index.js';

const NOM_COMPOSANTES = {
  valeur: 'Valeur utilisateur-métier',
  temps: 'Sensibilité au temps',
  risque: "Réduction du risque ou activation d'opportunité",
  taille: 'Taille du travail',
} as const;

export function construireExportExhaustif(init: Initiative): string {
  const calc = new CalculateurWsjf();
  const r = calc.calculer(init);
  const qd = init.qualiteDecision();
  const dateExport = new Date().toISOString().slice(0, 10);

  const lignes: string[] = [];
  lignes.push(`# ${init.nom()}`);
  lignes.push('');
  lignes.push('## Métadonnées');
  lignes.push(`- **ID interne** : ${init.id()}`);
  lignes.push(`- **Domaine ou équipe** : ${init.domaine() || 'Non précisé'}`);
  lignes.push(`- **Élément de repère** : ${init.elementRepere() || 'Non précisé'}`);
  lignes.push(`- **Date de création** : ${init.dateCreation().toISOString().slice(0, 10)}`);
  lignes.push(`- **Date d'export** : ${dateExport}`);
  lignes.push('');

  lignes.push('## Synthèse WSJF');
  lignes.push('');
  lignes.push('| Composante | Note Fibonacci |');
  lignes.push('|---|---|');
  lignes.push(`| Valeur utilisateur-métier | ${r.valeur} |`);
  lignes.push(`| Sensibilité au temps | ${r.temps} |`);
  lignes.push(`| Réduction du risque / opportunité | ${r.risque} |`);
  lignes.push(`| **Coût d'attente (V+T+R)** | **${r.coutDuDelai}** |`);
  lignes.push(`| Taille du travail | ${r.taille} |`);
  lignes.push(`| **Note WSJF (officielle)** | **${r.noteBrute.formatFr()}** |`);
  lignes.push(`| Note pondérée par confiance (indicative) | ${r.notePonderee.formatFr()} |`);
  lignes.push('');

  if (init.resultatAttendu().trim()) {
    lignes.push('## Résultat attendu');
    lignes.push(init.resultatAttendu().trim());
    lignes.push('');
  }

  // Détail composante par composante
  (['valeur', 'temps', 'risque', 'taille'] as const).forEach((c) => {
    lignes.push(`## ${NOM_COMPOSANTES[c]}`);
    lignes.push('');
    const catalogue = catalogueDe(c);
    const qualifs = init.qualifications()[c];

    lignes.push('### Sous-critères qualifiés');
    catalogue.forEach((desc) => {
      const q = qualifs.get(desc.lettre);
      const libelle = q ? q.libelle() : 'Non qualifié';
      const indicateur = libelle === 'Fort' ? '🟢' :
        libelle === 'Moyen' ? '🟡' :
        libelle === 'Faible' ? '🔴' : '⚪';
      lignes.push(`- **${desc.lettre}.** ${desc.libelle.replace(/ :$/, '')}`);
      lignes.push(`  → ${indicateur} **${libelle}**`);
    });
    lignes.push('');

    // Notes libres saisies pendant le pointage
    const preuve = init.preuves()[c];
    if (preuve.trim()) {
      lignes.push('### Notes libres saisies');
      lignes.push('');
      lignes.push('> ' + preuve.replace(/\n/g, '\n> '));
      lignes.push('');
    }
  });

  lignes.push('## Qualité de la décision (hors calcul)');
  lignes.push('');
  lignes.push(`- **Niveau de confiance** : ${qd.confiance.libelle()} (facteur ${r.facteurConfiance.toFixed(2).replace('.', ',')})`);
  lignes.push(`- **Décision retenue** : ${qd.decision.libelle()}`);
  lignes.push('');
  if (qd.arbitrage.trim()) {
    lignes.push('### Arbitrage explicite retenu');
    lignes.push('');
    lignes.push('> ' + qd.arbitrage.trim().replace(/\n/g, '\n> '));
    lignes.push('');
  }

  return lignes.join('\n');
}
