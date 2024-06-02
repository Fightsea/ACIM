import { useState } from 'react';
import { useMount } from 'react-use';
import { produce } from 'immer';
import * as OpenCC from 'opencc-js';
import { parseParagraphId } from './utils';
import _merge from 'lodash/merge';

const files = [
  'T-1_EN',
  'T-1_CHS',
  'T-2_EN',
  'T-2_CHS',
  'T-3_EN',
  'T-3_CHT',
  'T-4_EN',
  'T-4_CHT',
  'T-5_EN',
  'T-5_CHT',
  'T-6_EN',
  'T-6_CHS',
  'T-7_EN',
  'T-7_CHS',
  'T-8_EN',
  'T-8_CHS',
  'T-9_EN',
  'T-9_CHS',
];

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

const readFile = async filePath => {
  const f = await fetch(filePath);
  return await f.text();
};

const parseFile = async filePath => {
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

        const replaceMap = {
          '(20)': '⒇',
          '(19)': '⒆',
          '(18)': '⒅',
          '(17)': '⒄',
          '(16)': '⒃',
          '(15)': '⒂',
          '(14)': '⒁',
          '(13)': '⒀',
          '(12)': '⑿',
          '(11)': '⑾',
          '(10)': '⑽',
          '(9)': '⑼',
          '(8)': '⑻',
          '(7)': '⑺',
          '(6)': '⑹',
          '(5)': '⑸',
          '(4)': '⑷',
          '(3)': '⑶',
          '(2)': '⑵',
          '(1)': '⑴',
        };

        let testLine = Object.values(replaceMap).includes(line.slice(0, 2)) ? line.slice(2) : line;
        testLine = ['“'].includes(testLine[0]) ? testLine.slice(1) : testLine;
        const t = testLine.match(/^[A-Za-z_]/g) ? '_EN' : '_CHT';
        let data = null;

        if (t === '_CHT') {
          line = converter(line);
        }

        if (p) {
          for (const [old, newOne] of Object.entries(replaceMap)) {
            line = line.replace(old, newOne);
          }

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
              line = line.replace(old, newOne);
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
              '1 0': '10',
              '1 1': '11',
              '1 2': '12',
              '1 3': '13',
              '1 4': '14',
              '1 5': '15',
              '1 6': '16',
              '1 7': '17',
              '1 8': '18',
              '1 9': '19',
              '2 0': '20',
              '2 1': '21',
              '2 2': '22',
              '2 3': '23',
              '2 4': '24',
              '2 5': '25',
              '2 6': '26',
              '2 7': '27',
              '2 8': '28',
              '2 9': '29',
              '3 0': '30',
            };
            for (const [old, newOne] of Object.entries(replaceMapCHT)) {
              line = line.replace(String(old), newOne);
            }
          }
          const matches = line.match(/\d+/g); // foo35bar5abcd88 => 35, 5, 88;
          const count = matches ? parseInt(matches[matches.length - 1]) : 1;
          // if (v === 'T' && c === '2' && s === 'V-A') {
          //   console.log({ matches, count, t, line });
          // }
          data = { [v]: { [String(c)]: { [s]: { [String(p)]: { [t]: line, _sentences: count } } } } };
        } else if (s) {
          data = { [v]: { [String(c)]: { [s]: { [t]: line } } } };
        } else if (c) {
          data = { [v]: { [String(c)]: { [t]: line } } };
        }

        _merge(draft, data);
      });
  });
};

export default function useRawNew() {
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
