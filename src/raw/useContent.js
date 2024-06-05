import { useState, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
import useMongoDB from './useMongoDB';
import useRawFile from './useRawFile';
import { Translation } from '../app/Def';
import { googleTranslate } from './google';
import { Template } from './Template';
import { produce } from 'immer';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';
import _mergeWith from 'lodash/mergeWith';

const enableGoogleTranslate = true;
const TranslationKeys = Object.keys(Translation) ?? [];

export default function useContent({ volume, chapter, section, paragraph }) {
  const { fileContent } = useRawFile();
  const { ready, dbCentent, dbHighlight, dbSettings, dbTranslation, writeDbContent, writeDbHighlight, writeDbSettings, writeDbTranslation } =
    useMongoDB();
  const lastRead = dbSettings?.lastRead ?? null;
  const showSection = !(volume === 'W' || (volume === 'T' && chapter === 'in'));

  const [content, setContent] = useState(Template);
  const [sentences, setSentences] = useState([]);
  const [newTranslation, setNewTranslation] = useState(null);

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

  const syncSettingsToDB = () => {
    const id = showSection ? `${volume}-${chapter}.${section}.${paragraph}.` : `${volume}-${chapter}.${paragraph}.`;
    if (!_isEmpty(lastRead) && !_isEqual(id, lastRead[volume])) {
      let newData = { ...dbSettings };
      newData = produce(newData, draft => {
        _merge(draft, { lastRead: { [volume]: id } });
      });
      writeDbSettings(newData);
    }
  };

  const syncTranslationToDB = tr => {
    let newData = { ...dbTranslation };
    newData = produce(newData, draft => {
      _merge(draft, tr);
    });
    writeDbTranslation(newData);
  };

  const syncHightlightToDB = hl => {
    let newData = { ...dbHighlight };
    newData = produce(newData, draft => {
      _mergeWith(draft, hl, (oldValue, newValue) => {
        if (Array.isArray(newValue)) {
          return newValue; // overwrite array value
        } else {
          return undefined; // merge object (by default)
        }
      });
    });
    writeDbHighlight(newData);
  };

  const hanhleToggleHightlight = idx => {
    const h = showSection ? dbHighlight?.[volume]?.[chapter]?.[section]?.[paragraph] : dbHighlight?.[volume]?.[chapter]?.[paragraph];
    const set = new Set(h);
    if (set.has(idx)) {
      set.delete(idx);
    } else {
      set.add(idx);
    }
    const data = showSection
      ? {
          [volume]: { [chapter]: { [section]: { [paragraph]: [...set] } } },
        }
      : { [volume]: { [chapter]: { [paragraph]: [...set] } } };
    syncHightlightToDB(data);
  };

  const volumes = useMemo(
    () =>
      Object.keys(content).reduce((res, v) => {
        if (v !== '_id') {
          res[v] = {};
          TranslationKeys.forEach(t => {
            res[v][t] = content[v][t];
          });
        }
        return res;
      }, {}),
    [content],
  );

  const chapters = useMemo(() => {
    let cs = {};
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
    }
    return cs;
  }, [content, volume]);

  const sections = useMemo(() => {
    let ss = {};
    if (chapter) {
      if (showSection) {
        ss = Object.keys(content[volume][chapter]).reduce((res, s) => {
          if (!TranslationKeys.includes(s)) {
            res[s] = {};
            TranslationKeys.forEach(t => {
              res[s][t] = content[volume][chapter][s][t];
            });
          }
          return res;
        }, {});
      }
    }
    return ss;
  }, [content, volume, chapter]);

  const paragraphs = useMemo(() => {
    let ps = {};
    if (volume) {
      if (chapter) {
        if (showSection) {
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
    return ps;
  }, [content, volume, chapter, section]);

  useUpdateEffect(() => {
    const getSentences = async () => {
      const p = showSection ? content?.[volume]?.[chapter]?.[section]?.[paragraph] : content?.[volume]?.[chapter]?.[paragraph];
      const h = showSection ? dbHighlight?.[volume]?.[chapter]?.[section]?.[paragraph] : dbHighlight?.[volume]?.[chapter]?.[paragraph];
      const g = showSection
        ? dbTranslation?.[volume]?.[chapter]?.[section]?.[paragraph]?.['_GOOGLE']
        : dbTranslation?.[volume]?.[chapter]?.[paragraph]?.['_GOOGLE'];
      let sts = [];
      if (p) {
        // google translate
        if (enableGoogleTranslate) {
          if (_isEmpty(g) && !_isEmpty(p._EN)) {
            const en = p._EN.replaceAll('_', '').replaceAll('*', '');
            const res = await googleTranslate(en);
            if (res.data.translations?.[0]?.translatedText) {
              const tr = res.data.translations[0].translatedText;
              setNewTranslation(
                showSection
                  ? {
                      [volume]: { [chapter]: { [section]: { [paragraph]: { _GOOGLE: tr } } } },
                    }
                  : { [volume]: { [chapter]: { [paragraph]: { _GOOGLE: tr } } } },
              );
            }
          }
        }
        sts = Array(p._sentences ?? 0)
          .fill('')
          .map((_, idx) => {
            const st = {};
            for (const t of TranslationKeys) {
              const pt = t === '_GOOGLE' ? g ?? '' : p[t] ?? '';
              if (pt) {
                const start = idx === 0 ? 0 : pt.indexOf(String(idx + 1));
                const end = idx === p._sentences - 1 ? pt.length : pt.indexOf(String(idx + 2));
                const text = pt.substring(start, end);
                st[t] = text;
                // highlight
                if (h?.includes(idx + 1)) {
                  st._highlight = true;
                }
              }
            }
            return st;
          });
      }
      setSentences(sts);
    };
    getSentences();
  }, [content, dbTranslation, dbHighlight, volume, chapter, section, paragraph]);

  useUpdateEffect(() => {
    mergeContent(fileContent);
  }, [fileContent]);

  useUpdateEffect(() => {
    mergeContent(dbCentent);
  }, [dbCentent]);

  useUpdateEffect(() => {
    syncContentToDB(content);
  }, [content]);

  useUpdateEffect(() => {
    if (section && paragraph) {
      // syncSettingsToDB();
    }
  }, [section, paragraph]);

  useUpdateEffect(() => {
    if (newTranslation) {
      syncTranslationToDB(newTranslation);
    }
  }, [newTranslation]);

  return { volumes, chapters, sections, paragraphs, sentences, showSection, ready, lastRead, toggleHightlight: hanhleToggleHightlight };
}
