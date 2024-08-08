import { useState } from 'react';
import { useMount } from 'react-use';
import { produce } from 'immer';
import * as OpenCC from 'opencc-js';
import { parseParagraphId, isShowSection } from './utils';
import { files } from './raws';
import _merge from 'lodash/merge';

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

const readFile = async filePath => {
  const f = await fetch(filePath);
  return await f.text();
};

const parseFile = async filePath => {
  const t = filePath.endsWith('EN') ? '_EN' : '_CHT';
  const text = await readFile(filePath);
  return produce({}, draft => {
    text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .forEach(l => {
        const space = l.indexOf(' ');
        const id = l.substring(0, space);
        let line = l.substring(space + 1);
        const { v, c, s, p } = parseParagraphId(id);
        let data = null;

        if (t === '_CHT') {
          line = converter(line);
          const replaceMap = {
            '⻅': '見',
            '⻓': '長',
            '⻔': '門',
            '⻢': '馬',
            '⻛': '風',
            '⻜': '飛',
            '⻚': '頁',
            '⻉': '貝',
            隻: '只',
            療愈: '療癒',
            迴歸: '回歸',
            禰: '祢',
          };
          for (const [old, newOne] of Object.entries(replaceMap)) {
            line = line.replaceAll(String(old), newOne);
          }
        }

        if (p) {
          if (t === '_EN') {
            const replaceMapEN = {
              '³⁰': '30 ',
              '²⁹': '29 ',
              '²⁸': '28 ',
              '²⁷': '27 ',
              '²⁶': '26 ',
              '²⁵': '25 ',
              '²⁴': '24 ',
              '²³': '23 ',
              '²²': '22 ',
              '²¹': '21 ',
              '²⁰': '20 ',
              '¹⁹': '19 ',
              '¹⁸': '18 ',
              '¹⁷': '17 ',
              '¹⁶': '16 ',
              '¹⁵': '15 ',
              '¹⁴': '14 ',
              '¹³': '13 ',
              '¹²': '12 ',
              '¹¹': '11 ',
              '¹⁰': '10 ',
              '⁹': '9 ',
              '⁸': '8 ',
              '⁷': '7 ',
              '⁶': '6 ',
              '⁵': '5 ',
              '⁴': '4 ',
              '³': '3 ',
              '²': '2 ',
              '¹': '1 ',
              '⁰': '0 ',
            };
            for (const [old, newOne] of Object.entries(replaceMapEN)) {
              line = line.replaceAll(String(old), newOne);
            }
          } else if (t === '_CHT') {
            line = line.replaceAll(' ', '');
            const replaceMapCHT = {
              0: '0 ',
              1: '1 ',
              2: '2 ',
              3: '3 ',
              4: '4 ',
              5: '5 ',
              6: '6 ',
              7: '7 ',
              8: '8 ',
              9: '9 ',
              ' 0': '0',
              ' 1': '1',
              ' 2': '2',
              ' 3': '3',
              ' 4': '4',
              ' 5': '5',
              ' 6': '6',
              ' 7': '7',
              ' 8': '8',
              ' 9': '9',
              '(0 ': '(0',
              '(1 ': '(1',
              '(2 ': '(2',
              '(3 ': '(3',
              '(4 ': '(4',
              '(5 ': '(5',
              '(6 ': '(6',
              '(7 ': '(7',
              '(8 ': '(8',
              '(9 ': '(9',
              ' 0)': '0)',
              ' 1)': '1)',
              ' 2)': '2)',
              ' 3)': '3)',
              ' 4)': '4)',
              ' 5)': '5)',
              ' 6)': '6)',
              ' 7)': '7)',
              ' 8)': '8)',
              ' 9)': '9)',
              '0 )': '0)',
              '1 )': '1)',
              '2 )': '2)',
              '3 )': '3)',
              '4 )': '4)',
              '5 )': '5)',
              '6 )': '6)',
              '7 )': '7)',
              '8 )': '8)',
              '9 )': '9)',
              ')': ') ',
            };
            for (const [old, newOne] of Object.entries(replaceMapCHT)) {
              line = line.replaceAll(String(old), newOne);
            }
          }
          let count = 1;
          if (v !== 'Preface') {
            const matches = line.match(/\(*\d+\)*/g)?.filter(i => !isNaN(i)); // fo(2)o35bar5abc(44)d88 => (2), 35, 5, (44), 88 ==> 35, 5, 8;
            count = matches ? parseInt(matches[matches.length - 1]) : 1;
          }
          data = isShowSection({ v, c })
            ? { [v]: { [String(c)]: { [s]: { [String(p)]: { [t]: line, _sentences: count } } } } }
            : { [v]: { [String(c)]: { [String(p)]: { [t]: line, _sentences: count } } } };
        } else if (s) {
          data = { [v]: { [String(c)]: { [s]: { [t]: line } } } };
        } else if (c) {
          data = { [v]: { [String(c)]: { [t]: line } } };
        }

        _merge(draft, data);
      });
  });
};

export default function useRawFile() {
  const [fileContent, setFileContent] = useState({});

  useMount(async () => {
    let data = {};
    await Promise.all(
      files.map(async f => {
        const parsed = await parseFile(`/ACIM/raw/${f}`);
        data = produce(data, draft => {
          _merge(draft, parsed);
        });
      }),
    );
    setFileContent(data);
  });

  return { fileContent };
}
