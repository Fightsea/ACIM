import axios from 'axios';
import { parse } from 'node-html-parser';

export async function cambridgeDictionary(word) {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${word}`);
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.us.dpron-i'), ...root.querySelectorAll('div.ddef_b')]; // root.querySelectorAll('div.di-body')
      }
    }
  } catch (e) {}
}

export async function drEyeDictionary(word) {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://yun.dreye.com/dict_new/dict_min.php?w=${word}&hidden_codepage=01`);
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.phonetic'), ...root.querySelectorAll('div.content')];
      }
    }
  } catch (e) {}
}

export async function eudicDictionary(word) {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://dict.eudic.net/dicts/en/${word}`);
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.phonitic-line'), ...root.querySelectorAll('div.explain_wrap')];
      }
    }
  } catch (e) {}
}
