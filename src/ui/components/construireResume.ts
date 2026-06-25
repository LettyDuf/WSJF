import { CalculateurWsjf } from '../../domain/index.js';
import type { BrouillonInitiative } from '../state/StoreApplication.js';

export function construireResume(b: BrouillonInitiative, calc: CalculateurWsjf): string {
  const init = brouillonEnInitiativeFactice(b);
  const r = calc.calculer(init);
  if (!r.complet) return 'Brouillon incomplet — compléter les 4 composantes.';
  const qualifsLignes = (['valeur', 'temps', 'risque', 'taille'] as const)
    .map((c) => {
      const m = b.qualifications[c];
      if (m.size === 0) return '- ' + c + ' : aucun sous-critère qualifié';
      const items = Array.from(m).map(([l, q]) => l + ': ' + q.libelle()).join(', ');
      return '- ' + c + ' : ' + items;
    });
  return [
    'Exercice de priorisation WSJF',
    'Élément : ' + (b.nom.trim() || 'Sans titre'),
    'Domaine ou équipe : ' + (b.domaine.trim() || 'Non précisé'),
    'Élément de repère : ' + (b.elementRepere.trim() || 'Non précisé'),
    'Résultat attendu : ' + (b.resultatAttendu.trim() || 'Non précisé'),
    '',
    "Formule : note WSJF = (valeur + temps + risque) / taille",
    'Valeur utilisateur-métier : ' + r.valeur,
    'Sensibilité au temps : ' + r.temps,
    "Réduction du risque ou activation d'opportunité : " + r.risque,
    "Coût d'attente : " + r.coutDuDelai,
    'Taille du travail : ' + r.taille,
    'Note WSJF (officielle) : ' + r.noteBrute.formatFr(),
    'Note pondérée (indicative, hors calcul) : ' + r.notePonderee.formatFr() +
      ' [facteur ' + r.facteurConfiance.toFixed(2).replace('.', ',') + ']',
    '',
    'Sous-critères qualifiés :',
    ...qualifsLignes,
    '',
    'Notes libres :',
    '- Valeur : ' + (b.preuves.valeur || 'Non précisé'),
    '- Temps : ' + (b.preuves.temps || 'Non précisé'),
    "- Risque ou opportunité : " + (b.preuves.risque || 'Non précisé'),
    '- Taille : ' + (b.preuves.taille || 'Non précisé'),
    '',
    'Qualité de la décision (Hors calcul) :',
    'Niveau de confiance : ' + b.confiance.libelle(),
    'Décision retenue : ' + b.decision.libelle(),
    'Arbitrage : ' + (b.arbitrage.trim() || 'Non précisé'),
  ].join('\n');
}

function brouillonEnInitiativeFactice(b: BrouillonInitiative) {
  return {
    id: () => 'preview', nom: () => b.nom, domaine: () => b.domaine,
    elementRepere: () => b.elementRepere, resultatAttendu: () => b.resultatAttendu,
    valeur: () => b.valeur, temps: () => b.temps, risque: () => b.risque, taille: () => b.taille,
    preuves: () => b.preuves, facteursTaille: () => b.facteursTaille,
    qualifications: () => b.qualifications,
    qualiteDecision: () => ({
      confiance: b.confiance, decision: b.decision, arbitrage: b.arbitrage,
    }),
    dateCreation: () => new Date(),
    estComplete: () => b.valeur !== null && b.temps !== null && b.risque !== null && b.taille !== null,
    coutDuDelai: () => (b.valeur?.valeur() ?? 0) + (b.temps?.valeur() ?? 0) + (b.risque?.valeur() ?? 0),
  } as unknown as import('../../domain/index.js').Initiative;
}
