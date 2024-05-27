import { useState } from 'react';
import { useMount } from 'react-use';
import { produce } from 'immer';
import { parseParagraphId } from './utils';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';

const files = ['T-3', 'T-4', 'T-5', 'T-27'];

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
        const line = l.substring(space + 1);
        const { v, c, s, p } = parseParagraphId(id);
        const t = line[0].toUpperCase() !== line[0].toLowerCase() ? '_EN' : '_CHT';

        const matches = line.match(/\d+/g); // foo35bar5abcd88 => 35, 5, 88;
        const count = matches ? parseInt(matches[matches.length - 1]) : 1;
        const data = { [v]: { [String(c)]: { [s]: { [String(p)]: { [t]: line, _sentences: count } } } } };
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
