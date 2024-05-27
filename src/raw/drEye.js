import axios from 'axios';
import { parse } from 'node-html-parser';

export async function drEyeDictionary(word) {
  if (Boolean(word.trim())) {
    const res = await axios.get(`https://yun.dreye.com/dict_new/dict.php?w=${word}&hidden_codepage=01`);
    if (res.status === 200) {
      const root = parse(res.data);
      return root.querySelectorAll('div.content');
    }
  }
}
