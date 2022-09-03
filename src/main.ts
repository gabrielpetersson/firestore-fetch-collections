import { initializeApp, cert } from 'firebase-admin/app';
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';

import serviceAccount from '../firebase-secret.json' assert { type: 'json' };
initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

const collections = await db.listCollections();
const collectionNames: string[] = collections.map(
  (collection) => collection.id,
);

const tableMap: Record<string, any[]> = {};
for (const collectionName of collectionNames) {
  const collectionRef = db.collection(collectionName);
  const rows: any[] = [];
  const snapshot = await collectionRef.get();

  snapshot.forEach(async (doc) => {
    // with below, doc sub-collections can be fetched
    // const docCollections = await doc.ref.listCollections();
    // const docCollectionNames: string[] = docCollections.map(
    //   (collection) => collection.id,
    // );

    const docData = doc.data();
    const parsedData = {};
    for (const docKey in docData) {
      const docValue = docData[docKey];

      let parsedValue: string;
      if (docValue instanceof DocumentReference) {
        parsedValue = docValue.path;
      } else if (docValue != null && typeof docValue === 'object') {
        parsedValue = JSON.stringify(docValue);
      } else {
        parsedValue = docValue;
      }
      parsedData[docKey] = parsedValue;
    }

    rows.push(parsedData);
  });

  tableMap[collectionName] = rows;
}

console.log(tableMap);
