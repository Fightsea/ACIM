import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';
import { produce } from 'immer';
import { Content } from './Content';
import _merge from 'lodash/merge';

const firebaseConfig = {};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db);

export async function getRawFromDB() {
  const raw = {};
  try {
    const c = await get(child(dbRef, `Content`));
    if (c.exists()) {
      raw.Content = c.val();
    }
  } catch (e) {
    console.error('getRawFromDB ERROR:', e);
  } finally {
    return { ...raw };
  }
}

const files = ['T-3.', 'T-4.', 'T-27.'];

export async function getRawFromFile() {
  let res = { ...Content };
  for (const f of files) {
    const data = await parseFile(`/ACIM/raw/${f}`);
    res = produce(res, draft => {
      _merge(draft, data);
    });
  }
  return res;
}

async function parseFile(filePath) {
  const f = await fetch(filePath);
  const text = await f.text();
  return produce({}, draft => {
    text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .forEach(l => {
        const space = l.indexOf(' ');
        const id = l.substring(0, space);
        const line = l.substring(space + 1);
        const cStart = id.indexOf('-') + 1;
        const cEnd = id.indexOf('.', cStart);
        const sStart = cEnd + 1;
        const sEnd = id.indexOf('.', sStart);
        const pStart = sEnd + 1;
        const pEnd = id.indexOf('.', pStart);

        const v = id[0];
        const c = id.substring(cStart, cEnd);
        const s = id.substring(sStart, sEnd);
        const p = id.substring(pStart, pEnd);
        const t = line[0].toUpperCase() !== line[0].toLowerCase() ? '_EN' : '_CHT';
        const matches = line.match(/\d+/g); // foo35bar5abcd88 => 35, 5, 88;
        const count = parseInt(matches[matches.length - 1]);
        const data = { [v]: { [c]: { [s]: { [p]: { [t]: line, _sentences: count } } } } };
        _merge(draft, data);
      });
  });
}
