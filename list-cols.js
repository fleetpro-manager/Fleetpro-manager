import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp({
  projectId: config.projectId
});

const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const usersSnap = await db.collection('users').get();
    for (const doc of usersSnap.docs) {
      const subCols = await doc.ref.listCollections();
      if (subCols.length > 0) {
        console.log(`User ${doc.id} has subcollections:`, subCols.map(c => c.id).join(', '));
        for (const col of subCols) {
            const snap = await col.get();
            console.log(` - ${col.id}: ${snap.size} docs`);
        }
      } else {
        console.log(`User ${doc.id} has no subcollections.`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

run();
