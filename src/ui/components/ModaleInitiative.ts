/**
 * Modale de détail / copie / édition d'une initiative.
 *
 * Affiche tout le contenu d'une initiative en lecture, avec :
 *  - Bouton "Copier au format Jira"
 *  - Bouton "Copier exhaustif (gouvernance)"
 *  - Bouton "Modifier" (recharge dans le brouillon)
 *  - Bouton Fermer
 *
 * Accessibilité : role="dialog", aria-modal, focus trap, fermeture ESC.
 */

import { CalculateurWsjf, catalogueDe } from '../../domain/index.js';
import type { Initiative } from '../../domain/index.js';
import { elt } from '../helpers/dom.js';
import { construireMarkdownJira } from '../formats/formatJiraMarkdown.js';
import { construireExportExhaustif } from '../formats/formatExhaustifMarkdown.js';
import { CalculateurWsjf as CalcWsjf } from '../../domain/index.js';
import { creerMenuDeroulant } from './MenuDeroulant.js';
import type { PressePapier } from '../../ports/PressePapier.js';
import type { NotificateurUtilisateur } from '../../ports/NotificateurUtilisateur.js';

export interface DepsModale {
  pressePapier: PressePapier;
  notificateur: NotificateurUtilisateur;
  surModification: (init: Initiative) => void;
}

export function afficherModaleInitiative(
  init: Initiative,
  deps: DepsModale,
): void {
  const calc = new CalculateurWsjf();
  const r = calc.calculer(init);
  const qd = init.qualiteDecision();

  const fermer = () => {
    overlay.remove();
    document.removeEventListener('keydown', surEcho);
  };
  const surEcho = (e: KeyboardEvent) => { if (e.key === 'Escape') fermer(); };
  document.addEventListener('keydown', surEcho);

  // Boutons d'action
  const menuCopier = creerMenuDeroulant({
    libelleBouton: '📋 Copier',
    classeBouton: 'btn-principal',
    options: [
      {
        libelle: 'Format Jira (Markdown)',
        description: 'pour coller dans un billet Jira',
        surClic: async () => {
          const ok = await deps.pressePapier.ecrire(construireMarkdownJira(init));
          deps.notificateur.notifier(
            ok ? 'succes' : 'erreur',
            ok ? 'Format Jira copié dans le presse-papier.' : 'Échec de la copie.',
          );
        },
      },
      {
        libelle: 'Format exhaustif (Markdown)',
        description: 'pour archive et gouvernance',
        surClic: async () => {
          const ok = await deps.pressePapier.ecrire(construireExportExhaustif(init));
          deps.notificateur.notifier(
            ok ? 'succes' : 'erreur',
            ok ? 'Export exhaustif copié dans le presse-papier.' : 'Échec de la copie.',
          );
        },
      },
      {
        libelle: 'Texte brut',
        description: 'résumé court pour mail ou Teams',
        surClic: async () => {
          const texte = construireResumeBrutInitiative(init);
          const ok = await deps.pressePapier.ecrire(texte);
          deps.notificateur.notifier(
            ok ? 'succes' : 'erreur',
            ok ? 'Texte copié dans le presse-papier.' : 'Échec de la copie.',
          );
        },
      },
    ],
  });
  const btnModifier = elt('button', {
    type: 'button', class: 'btn-secondaire',
  }, ['✎ Modifier']);
  const btnFermer = elt('button', {
    type: 'button', class: 'btn-secondaire', 'aria-label': 'Fermer la modale',
  }, ['Fermer']);

  btnModifier.addEventListener('click', () => {
    deps.surModification(init);
    fermer();
  });
  btnFermer.addEventListener('click', fermer);

  // Synthèse en haut
  const synthese = elt('div', { class: 'modale-synthese' }, [
    elt('table', { class: 'modale-tableau-notes' }, [
      elt('thead', {}, [
        elt('tr', {}, [
          elt('th', {}, ['Valeur']),
          elt('th', {}, ['Temps']),
          elt('th', {}, ['Risque']),
          elt('th', {}, ['Coût d\'attente']),
          elt('th', {}, ['Taille']),
          elt('th', {}, ['Note WSJF']),
        ]),
      ]),
      elt('tbody', {}, [
        elt('tr', {}, [
          elt('td', {}, [String(r.valeur)]),
          elt('td', {}, [String(r.temps)]),
          elt('td', {}, [String(r.risque)]),
          elt('td', {}, [String(r.coutDuDelai)]),
          elt('td', {}, [String(r.taille)]),
          elt('td', {}, [r.noteBrute.formatFr()]),
        ]),
      ]),
    ]),
    elt('div', { class: 'modale-meta' }, [
      elt('span', {}, [
        elt('b', {}, ['Décision : ']), qd.decision.libelle(),
      ]),
      elt('span', {}, [
        elt('b', {}, ['Confiance : ']), qd.confiance.libelle(),
      ]),
    ]),
  ]);

  // Sous-critères regroupés par composante
  const blocsSC = elt('div', { class: 'modale-section' });
  (['valeur', 'temps', 'risque', 'taille'] as const).forEach((c) => {
    const titreComp = { valeur: 'Valeur', temps: 'Temps', risque: 'Risque', taille: 'Taille' }[c];
    const cat = catalogueDe(c);
    const qualifs = init.qualifications()[c];
    const items = cat.map((d) => {
      const q = qualifs.get(d.lettre);
      const lib = q ? q.libelle() : 'Non qualifié';
      const cls = lib === 'Fort' ? 'sq-fort' : lib === 'Faible' ? 'sq-faible' :
        lib === 'Moyen' ? 'sq-moyen' : 'sq-nq';
      return elt('li', { class: cls }, [
        elt('b', {}, [d.lettre + '.']),
        ' ' + d.libelle.replace(/ :$/, '') + ' — ',
        elt('span', { class: 'sq-tag' }, [lib]),
      ]);
    });
    blocsSC.appendChild(elt('div', { class: 'modale-sc-bloc' }, [
      elt('h3', {}, ['Sous-critères — ' + titreComp]),
      elt('ul', { class: 'modale-sc-liste' }, items),
    ]));
  });

  // Notes libres + arbitrage
  const blocsNotes = elt('div', { class: 'modale-section' });
  (['valeur', 'temps', 'risque', 'taille'] as const).forEach((c) => {
    const txt = init.preuves()[c];
    if (txt.trim()) {
      const titreComp = { valeur: 'Valeur', temps: 'Temps', risque: 'Risque', taille: 'Taille' }[c];
      blocsNotes.appendChild(elt('div', { class: 'modale-notes-bloc' }, [
        elt('h4', {}, ['Notes — ' + titreComp]),
        elt('p', { class: 'modale-notes-texte' }, [txt]),
      ]));
    }
  });
  if (qd.arbitrage.trim()) {
    blocsNotes.appendChild(elt('div', { class: 'modale-notes-bloc' }, [
      elt('h4', {}, ['Arbitrage explicite']),
      elt('p', { class: 'modale-notes-texte' }, [qd.arbitrage]),
    ]));
  }

  const corpsModale = elt('div', { class: 'modale-corps' }, [
    synthese,
    init.resultatAttendu().trim()
      ? elt('div', { class: 'modale-section' }, [
        elt('h3', {}, ['Résultat attendu']),
        elt('p', { class: 'modale-notes-texte' }, [init.resultatAttendu()]),
      ])
      : elt('span', {}),
    blocsSC,
    blocsNotes,
  ]);

  const modale = elt('div', {
    class: 'modale', role: 'dialog', 'aria-modal': 'true',
    'aria-labelledby': 'modale-titre',
  }, [
    elt('div', { class: 'modale-entete' }, [
      elt('div', {}, [
        elt('div', { class: 'surtitre' }, [init.domaine() || 'Sans domaine']),
        elt('h2', { id: 'modale-titre' }, [init.nom()]),
      ]),
      btnFermer,
    ]),
    corpsModale,
    elt('div', { class: 'modale-actions' }, [
      menuCopier, btnModifier,
    ]),
  ]);

  const overlay = elt('div', { class: 'modale-overlay' }, [modale]);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fermer();
  });

  document.body.appendChild(overlay);
  btnFermer.focus();
}

/**
 * Construit un résumé textuel court d'une initiative (texte brut).
 */
function construireResumeBrutInitiative(init: Initiative): string {
  const calc = new CalcWsjf();
  const r = calc.calculer(init);
  const qd = init.qualiteDecision();
  const lignes: string[] = [];
  lignes.push("Initiative : " + init.nom());
  if (init.domaine().trim()) lignes.push("Domaine : " + init.domaine());
  if (init.elementRepere().trim()) lignes.push("Repère : " + init.elementRepere());
  if (init.resultatAttendu().trim()) lignes.push("Résultat attendu : " + init.resultatAttendu());
  lignes.push("");
  lignes.push("Valeur " + r.valeur + " · Temps " + r.temps + " · Risque " + r.risque +
    " · Coût d'attente " + r.coutDuDelai + " · Taille " + r.taille);
  lignes.push("Note WSJF : " + r.noteBrute.formatFr() +
    " (pondérée " + r.notePonderee.formatFr() + ")");
  lignes.push("Décision : " + qd.decision.libelle() + " · Confiance : " + qd.confiance.libelle());
  if (qd.arbitrage.trim()) {
    lignes.push("");
    lignes.push("Arbitrage : " + qd.arbitrage);
  }
  return lignes.join('\n');
}
