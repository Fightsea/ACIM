import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { readFile } from './useRawFile';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const publishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;
const TABLE = 'ACIM';

const supabase = createClient(supabaseUrl, publishableKey);

export default function useSupabaseDB() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [dbHighlight, setDbHighlight] = useState(null);
  const [dbContent, setDbContent] = useState(null);
  const [dbNotes, setDbNotes] = useState(null);
  const [dbSettings, setDbSettings] = useState(null);
  const [dbTranslation, setDbTranslation] = useState(null);
  const [rowId, setRowId] = useState(null);

  const readDB = useCallback(async () => {
    const tr = await readFile('/ACIM/raw/dbTranslation');
    setDbTranslation(JSON.parse(tr));

    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) {
      return;
    }
    if (data.length > 0) {
      const row = data[0];
      setRowId(row.id);
      setDbHighlight(row.Highlight || null);
      setDbNotes(row.Notes || null);
      setDbSettings(row.Settings || null);
      // setDbContent(row.Content || null);
      // setDbTranslation(data.Translation || null);

      setIsInitialized(true);
    }
  }, []);

  const writeDb = useCallback(
    async (column, jsonData) => {
      if (!rowId) {
        return;
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update({ [column]: jsonData })
        .eq('id', rowId)
        .select();

      if (!error) {
        switch (column) {
          case 'Highlight':
            setDbHighlight(jsonData);
            break;
          case 'Content':
            setDbContent(jsonData);
            break;
          case 'Notes':
            setDbNotes(jsonData);
            break;
          case 'Settings':
            setDbSettings(jsonData);
            break;
          case 'Translation':
            setDbTranslation(jsonData);
            break;
          default:
            break;
        }
      }
    },
    [rowId],
  );

  const { writeDbHighlight, writeDbContent, writeDbNotes, writeDbSettings, writeDbTranslation } = useMemo(
    () => ({
      writeDbHighlight: async data => writeDb('Highlight', data),
      writeDbContent: async data => writeDb('Content', data),
      writeDbNotes: async data => writeDb('Notes', data),
      writeDbSettings: async data => writeDb('Settings', data),
      writeDbTranslation: async data => writeDb('Translation', data),
    }),
    [writeDb],
  );

  useEffect(() => {
    readDB();
  }, [readDB]);

  return {
    ready: isInitialized,
    dbHighlight,
    dbContent,
    dbNotes,
    dbSettings,
    dbTranslation,
    writeDbHighlight,
    writeDbContent,
    writeDbNotes,
    writeDbSettings,
    writeDbTranslation,
  };
}
