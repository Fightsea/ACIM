import { useState, useCallback } from 'react';
import { useMount } from 'react-use';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get, set } from 'firebase/database';
import { googleConfig as firebaseConfig } from './google';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

export default function useFirebase() {
  const [dbCentent, setDbCentent] = useState({});

  const writeFirebase = useCallback(data => {
    set(ref(db, `Content`), data);
  }, []);

  useMount(async () => {
    let raw = {};
    try {
      const c = await get(child(dbRef, `Content`));
      if (c.exists()) {
        raw = c.val();
      }
    } catch (e) {
      console.error('getRawFromDB ERROR:', e);
    } finally {
      setDbCentent({ ...raw });
    }
  });

  return { dbCentent, writeFirebase };
}
