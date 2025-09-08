import { openDB } from 'idb';

const DB_NAME = 'reports-db';
const STORE_NAME = 'pending-reports';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function addReportToQueue(report) {
  const db = await initDB();
  await db.put(STORE_NAME, report);
}

export async function getQueuedReports() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearQueuedReports() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}
