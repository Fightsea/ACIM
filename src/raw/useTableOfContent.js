import { useState, useEffect } from 'react';
import { useMount } from 'react-use';
import { produce } from 'immer';
import _chunk from 'lodash/chunk';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';

const files = ['TableOfContent'];
const separator = '第';

const readFile = async filePath => {
  const f = await fetch(filePath);
  return await f.text();
};

const parseFile = async filePath => {
  const text = await readFile(filePath);
  return produce({}, draft => {
    text
      .split(separator)
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(t => {
        const v = 'T';
        let c = null;
        const trParis = _chunk(
          (separator + t)
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean),
          2,
        );
        trParis.forEach(async ([cht, en], idx) => {
          let data = {};
          if (idx === 0) {
            c = en.substring(en.indexOf(' ') + 1, en.indexOf('.'));
            data = { [v]: { [String(c)]: { _EN: en, _CHT: cht } } };
          } else {
            const s = en.substring(0, en.indexOf('.'));
            data = { [v]: { [String(c)]: { [s]: { _EN: en, _CHT: cht } } } };
          }
          _merge(draft, data);
        });
      });
  });
};

export default function useTableOfContent() {
  const [tableOfContent, setTableOfContent] = useState({});

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
    setTableOfContent(data);
  });

  return { tableOfContent };
}
