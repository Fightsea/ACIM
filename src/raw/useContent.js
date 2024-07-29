import { useState, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
import useMongoDB from './useMongoDB';
import useRawFile from './useRawFile';
import { Translation } from '../app/Def';
import { googleTranslate } from './google';
import { Template } from './Template';
import { isShowSection, isShowParagraph } from './utils';
import { produce } from 'immer';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';
import _mergeWith from 'lodash/mergeWith';

const TranslationKeys = Object.keys(Translation) ?? [];

export default function useContent({ volume, chapter, section, paragraph }) {
  const { fileContent } = useRawFile();
  const { ready, dbCentent, dbHighlight, dbSettings, dbTranslation, writeDbContent, writeDbHighlight, writeDbSettings, writeDbTranslation } =
    useMongoDB();
  const lastRead = dbSettings?.lastRead ?? null;
  const showSection = isShowSection({ v: volume, c: chapter });
  const showParagraph = isShowParagraph({ v: volume, c: chapter });

  const [isSyncing, setIsSyncing] = useState(false);
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

  const syncContentToDB = async newData => {
    if (!_isEmpty(newData) && !_isEmpty(dbCentent) && !_isEqual(newData, dbCentent)) {
      setIsSyncing(true);
      await writeDbContent(newData);
      setIsSyncing(false);
    }
  };

  const syncSettingsToDB = () => {
    const id = showSection ? `${volume}-${chapter}.${section}.${paragraph}.` : `${volume}-${chapter}.${paragraph}.`;
    if (_isEmpty(lastRead) || (!_isEmpty(lastRead) && !_isEqual(id, lastRead[volume]))) {
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

  const handleTranslateParagraph = async ({ v, c, s, p, pObj }) => {
    if (JSON.parse(process.env.REACT_APP_ENABLE_GOOGLE_TRANSLATE)) {
      if (!_isEmpty(pObj._EN)) {
        const _s = s?.endsWith('-i') ? s.substring(0, section.length - 2) : s;
        const en = pObj._EN.replaceAll('_', '').replaceAll('*', '');
        const res = await googleTranslate(en);
        if (res.data.translations?.[0]?.translatedText) {
          const tr = res.data.translations[0].translatedText;
          console.log(v, c, _s, p, tr);
          return showSection
            ? {
                [v]: { [c]: { [_s]: { [p]: { _GOOGLE: tr } } } },
              }
            : { [v]: { [c]: { [p]: { _GOOGLE: tr } } } };
        }
      }
    }
    return null;
  };

  const syncFullChapterTranslation = async (v, c) => {
    if (JSON.parse(process.env.REACT_APP_ENABLE_GOOGLE_TRANSLATE)) {
      const f = fileContent?.[volume]?.[chapter];
      const g = dbTranslation?.[volume]?.[chapter];
      if (_isEmpty(g) && !_isEmpty(f)) {
        let newTr = {};
        if (showSection) {
          const ss = Object.keys(f).filter(i => !TranslationKeys.includes(i));
          for (const s of ss) {
            const ps = Object.keys(f[s]).filter(i => !TranslationKeys.includes(i));
            for (const p of ps) {
              if (!_isEmpty(f[s][p])) {
                const tr = await handleTranslateParagraph({ v, c, s, p, pObj: f[s][p] });
                if (tr) {
                  newTr = produce(newTr, draft => {
                    _merge(draft, tr);
                  });
                }
                await new Promise(r => setTimeout(r, 1500));
              }
            }
          }
        } else {
          const ps = Object.keys(f).filter(i => !TranslationKeys.includes(i));
          for (const p of ps) {
            if (!_isEmpty(f[p])) {
              const tr = await handleTranslateParagraph({ v, c, s: null, p, pObj: f[p] });
              if (tr) {
                newTr = produce(newTr, draft => {
                  _merge(draft, tr);
                });
              }
              await new Promise(r => setTimeout(r, 1500));
            }
          }
        }
        setNewTranslation(newTr);
      }
    }
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
            const s = section.endsWith('-i') ? section.substring(0, section.length - 2) : section;
            let keys = Object.keys(content[volume][chapter][s]).filter(i => !TranslationKeys.includes(i));
            if (volume === 'T' && chapter === '19' && section.startsWith('IV-')) {
              switch (section) {
                case 'IV-A':
                  keys = keys.slice(0, 9);
                  break;
                case 'IV-A-i':
                  keys = keys.slice(9, 17);
                  break;
                case 'IV-B':
                  keys = keys.slice(0, 8);
                  break;
                case 'IV-B-i':
                  keys = keys.slice(8, 17);
                  break;
                case 'IV-C':
                  keys = keys.slice(0, 2);
                  break;
                case 'IV-C-i':
                  keys = keys.slice(2, 11);
                  break;
                case 'IV-D':
                  keys = keys.slice(0, 7);
                  break;
                case 'IV-D-i':
                  keys = keys.slice(7, 21);
                  break;
              }
            }
            ps = keys.reduce((res, p) => {
              res[p] = {};
              TranslationKeys.forEach(t => {
                res[p][t] = content[volume][chapter][s][p][t];
              });
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
      const s = section?.endsWith('-i') ? section.substring(0, section.length - 2) : section;
      const p = showSection ? content?.[volume]?.[chapter]?.[s]?.[paragraph] : content?.[volume]?.[chapter]?.[paragraph];
      const h = showSection ? dbHighlight?.[volume]?.[chapter]?.[s]?.[paragraph] : dbHighlight?.[volume]?.[chapter]?.[paragraph];
      const g = showSection
        ? dbTranslation?.[volume]?.[chapter]?.[s]?.[paragraph]?.['_GOOGLE']
        : dbTranslation?.[volume]?.[chapter]?.[paragraph]?.['_GOOGLE'];
      let sts = [];
      if (p) {
        // google translate
        if (!JSON.parse(process.env.REACT_APP_TRANSLATE_FULL_CHAPTER)) {
          if (_isEmpty(g)) {
            const tr = await handleTranslateParagraph({ v: volume, c: chapter, s: section, p: paragraph, pObj: p });
            if (tr) {
              setNewTranslation(tr);
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
                let skipBeginning = 0;
                if (volume === 'W' && ['rI', 'rII', 'rIII', 'rIV', 'rV', 'rVI'].includes(chapter)) {
                  // skip (1), (2), ...
                  skipBeginning = pt.indexOf(')');
                }
                const start = idx === 0 ? 0 : pt.indexOf(String(idx + 1), skipBeginning);
                const end = idx === p._sentences - 1 ? pt.length : pt.indexOf(String(idx + 2), skipBeginning);
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
    if (JSON.parse(process.env.REACT_APP_TRANSLATE_FULL_CHAPTER)) {
      if (volume && chapter) {
        syncFullChapterTranslation(volume, chapter);
      }
    }
  }, [volume, chapter]);

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
    if ((showSection && section && paragraph) || (!showSection && paragraph)) {
      syncSettingsToDB();
    }
  }, [section, paragraph, showSection]);

  useUpdateEffect(() => {
    if (newTranslation) {
      syncTranslationToDB(newTranslation);
    }
  }, [newTranslation]);

  return {
    volumes,
    chapters,
    sections,
    paragraphs,
    sentences,
    showSection,
    showParagraph,
    ready: Boolean(ready) && !Boolean(isSyncing),
    lastRead,
    toggleHightlight: hanhleToggleHightlight,
  };
}
