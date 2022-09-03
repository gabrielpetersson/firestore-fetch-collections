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

type Scalar = string | number | boolean | null; // dataland support only scalar data types
type ColumnName = string;
type TableName = string;
type Row = Record<ColumnName, Scalar>;
const tableMap: Record<TableName, Row[]> = {};
for (const collectionName of collectionNames) {
  const collectionRef = db.collection(collectionName);
  const rows: Row[] = [];
  const snapshot = await collectionRef.get();

  snapshot.forEach(async (doc) => {
    // with below, doc sub-collections can be fetched
    // const docCollections = await doc.ref.listCollections();
    // const docCollectionNames: string[] = docCollections.map(
    //   (collection) => collection.id,
    // );

    const row: Row = {};
    const docData = doc.data();
    for (const docKey in docData) {
      const docValue = docData[docKey];

      let parsedValue: Scalar;
      if (docValue instanceof DocumentReference) {
        parsedValue = docValue.path; // if reference to another document, show the path to that document
      } else if (docValue != null && typeof docValue === 'object') {
        parsedValue = JSON.stringify(docValue);
      } else {
        parsedValue = docValue;
      }
      row[docKey] = parsedValue;
    }

    rows.push(row);
  });

  tableMap[collectionName] = rows;
}

console.log(tableMap);
