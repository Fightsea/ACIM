import { useState, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
import useMongoDB from './useMongoDB';
import useRawFile from './useRawFile';
import useTableOfContent from './useTableOfContent';
import { Translation } from '../app/Def';
import { googleTranslate } from './google';
import { Template } from './Template';
import { produce } from 'immer';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';

const enableGoogleTranslate = true;
const TranslationKeys = Object.keys(Translation) ?? [];

export default function useContent({ volume, chapter, section, paragraph }) {
  const { tableOfContent } = useTableOfContent();
  const { fileContent } = useRawFile();
  const { dbCentent, dbSettings, writeDbContent, writeDbSettings } = useMongoDB();
  const lastRead = dbSettings?.lastRead ?? null;

  const [content, setContent] = useState(Template);
  const [newContent, setNewContent] = useState(null);
  const [sentences, setSentences] = useState([]);

  const mergeContent = newData => {
    if (!_isEmpty(newData)) {
      setContent(prev =>
        produce(prev, draft => {
          _merge(draft, newData);
        }),
      );
    }
  };

  const syncContentToDB = newData => {
    if (!_isEmpty(newData) && !_isEmpty(dbCentent) && !_isEqual(newData, dbCentent)) {
      writeDbContent(newData);
    }
  };

  const syncSettingsToDB = paragraph => {
    const id = volume !== 'W' ? `${volume}-${chapter}.${section}.${paragraph}.` : `${volume}-${chapter}.${paragraph}.`;
    if (!_isEmpty(lastRead) && !_isEqual(id, lastRead[volume])) {
      let newData = { ...dbSettings };
      newData = produce(newData, draft => {
        _merge(draft, { lastRead: { [volume]: id } });
      });
      writeDbSettings(newData);
    }
  };

  const volumes = useMemo(
    () =>
      Object.keys(content).reduce((res, v) => {
        res[v] = {};
        TranslationKeys.forEach(t => {
          res[v][t] = content[v][t];
        });
        return res;
      }, {}),
    [content],
  );

  const [chapters, sections, paragraphs] = useMemo(() => {
    let cs = [];
    let ss = [];
    let ps = [];
    if (volume) {
      cs = Object.keys(content[volume]).reduce((res, c) => {
        if (!TranslationKeys.includes(c)) {
          res[c] = {};
          TranslationKeys.forEach(t => {
            res[c][t] = content[volume][c][t];
          });
        }
        return res;
      }, {});

      if (chapter) {
        if (volume !== 'W') {
          ss = Object.keys(content[volume][chapter]).reduce((res, s) => {
            if (!TranslationKeys.includes(s)) {
              res[s] = {};
              TranslationKeys.forEach(t => {
                res[s][t] = content[volume][chapter][s][t];
              });
            }
            return res;
          }, {});
          if (section) {
            ps = Object.keys(content[volume][chapter][section]).reduce((res, p) => {
              if (!TranslationKeys.includes(p)) {
                res[p] = {};
                TranslationKeys.forEach(t => {
                  res[p][t] = content[volume][chapter][section][p][t];
                });
              }
              return res;
            }, {});
          }
        } else {
          ps = Object.keys(content[volume][chapter]).reduce((res, p) => {
            if (!TranslationKeys.includes(p)) {
              res[p] = {};
              TranslationKeys.forEach(t => {
                res[p][t] = content[volume][chapter][p][t];
              });
            }
            return res;
          }, {});
        }
      }
    }
    return [cs, ss, ps];
  }, [content, volume, chapter, section]);

  useUpdateEffect(() => {
    const getSentences = async () => {
      const p = volume !== 'W' ? content?.[volume]?.[chapter]?.[section]?.[paragraph] : content?.[volume]?.[chapter]?.[paragraph];
      let sts = [];
      if (p) {
        // google translate
        if (enableGoogleTranslate) {
          if (_isEmpty(p._GOOGLE) && !_isEmpty(p._EN)) {
            const res = await googleTranslate(p._EN);
            if (res.data.translations?.[0]?.translatedText) {
              const tr = res.data.translations[0].translatedText;
              setNewContent(
                volume !== 'W'
                  ? {
                      [volume]: { [chapter]: { [section]: { [paragraph]: { _GOOGLE: tr } } } },
                    }
                  : { [volume]: { [chapter]: { [paragraph]: { _GOOGLE: tr } } } },
              );
            }
          }
        }
        sts = await Promise.all(
          Array(p._sentences ?? 0)
            .fill('')
            .map(async (_, idx) => {
              const st = {};
              for (const t of TranslationKeys) {
                const pt = p[t] ?? '';
                if (pt) {
                  const start = idx === 0 ? 0 : pt.indexOf(String(idx + 1));
                  const end = idx === p._sentences - 1 ? pt.length : pt.indexOf(String(idx + 2));
                  const text = pt.substring(start, end);
                  st[t] = text;
                }
              }
              return st;
            }),
        );
      }
      setSentences(sts);
    };
    getSentences();
  }, [content, volume, chapter, section, paragraph]);

  useUpdateEffect(() => {
    mergeContent(tableOfContent);
  }, [tableOfContent]);

  useUpdateEffect(() => {
    mergeContent(fileContent);
  }, [fileContent]);

  useUpdateEffect(() => {
    mergeContent(dbCentent);
  }, [dbCentent]);

  useUpdateEffect(() => {
    mergeContent(newContent);
  }, [newContent]);

  useUpdateEffect(() => {
    syncContentToDB(content);
  }, [content]);

  useUpdateEffect(() => {
    if (paragraph) {
      syncSettingsToDB(paragraph);
    }
  }, [paragraph]);

  return { volumes, chapters, sections, paragraphs, sentences, lastRead };
}
