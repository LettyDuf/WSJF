/**
 * Composition root : câble les adaptateurs aux ports et monte l'App dans #app.
 */

import './ui/styles.css';
import { StoreApplication } from './ui/state/StoreApplication.js';
import { LocalStorageRepository } from './adapters/persistence/LocalStorageRepository.js';
import { ToastNotificateur } from './adapters/notification/ToastNotificateur.js';
import { ClipboardAdapter } from './adapters/notification/ClipboardAdapter.js';
import { ExcelExporteur } from './adapters/export/ExcelExporteur.js';
import { JsonExporteur } from './adapters/export/JsonExporteur.js';
import { CsvExporteur } from './adapters/export/CsvExporteur.js';
import { ExcelImporteur } from './adapters/import/ExcelImporteur.js';
import { JsonImporteur } from './adapters/import/JsonImporteur.js';
import { creerApp } from './ui/components/App.js';

async function demarrer(): Promise<void> {
  const racine = document.getElementById('app');
  if (!racine) throw new Error("Élément #app introuvable");

  const repository = new LocalStorageRepository();
  const initiatives = await repository.charger();
  const store = new StoreApplication(initiatives);

  const app = creerApp({
    store,
    repository,
    notificateur: new ToastNotificateur(),
    pressePapier: new ClipboardAdapter(),
    exporteurExcel: new ExcelExporteur(),
    exporteurJson: new JsonExporteur(),
    exporteurCsv: new CsvExporteur(),
    importeurExcel: new ExcelImporteur(),
    importeurJson: new JsonImporteur(),
  });
  racine.appendChild(app);
}

void demarrer();
