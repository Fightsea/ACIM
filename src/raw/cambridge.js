import axios from 'axios';
import { parse } from 'node-html-parser';

export async function cambridgeDictionary(word) {
  if (Boolean(word.trim())) {
    const res = await axios.get(`https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${word}`);
    if (res.status === 200) {
      const root = parse(res.data);
      return root.querySelectorAll('div.di-body');
    }
  }
}
