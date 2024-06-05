import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
import axios from 'axios';

const apiKey = process.env.REACT_APP_MONGODB_API_KEY;
const appId = process.env.REACT_APP_MONGODB_APP_ID;
const baseUrl = `https://services.cloud.mongodb.com/api/client/v2.0`;
const baseAppUrl = `${baseUrl}/app/${appId}`;
// const endpoint = `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1`;
const endpoint = `https://ap-southeast-1.aws.data.mongodb-api.com/app/${appId}/endpoint/data/v1`;
const accessTokenExp = 1800000; // 30 mins

const Collections = {
  Content: 'Content',
  Highlight: 'Highlight',
  Settings: 'Settings',
  Translation: 'Translation',
};

export default function useMongoDB() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [dbCentent, setDbCentent] = useState(null);
  const [dbHighlight, setDbHighlight] = useState(null);
  const [dbSettings, setDbSettings] = useState(null);
  const [dbTranslation, setDbTranslation] = useState(null);

  const setDbMap = {
    [Collections.Content]: setDbCentent,
    [Collections.Highlight]: setDbHighlight,
    [Collections.Settings]: setDbSettings,
    [Collections.Translation]: setDbTranslation,
  };

  const setDb = (collection, data) => {
    setDbMap[collection]?.(data);
  };

  const parseCredentials = credentials => {
    if (credentials?.access_token) {
      setAccessToken(credentials.access_token);
    }
    if (credentials?.refresh_token) {
      setRefreshToken(credentials.refresh_token);
    }
  };

  const updateAccessToken = async () => {
    if (refreshToken) {
      const res = await axios.post(
        `${baseUrl}/auth/session`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );
      parseCredentials(res.data);
      setTimeout(() => updateAccessToken(), accessTokenExp);
    }
  };

  const login = async () => {
    const res = await axios.post(
      `${baseAppUrl}/auth/providers/api-key/login`,
      { key: apiKey },
      { headers: { 'Content-Type': 'application/json' } },
    );
    parseCredentials(res.data);
  };

  const readDB = async collection => {
    if (accessToken) {
      const res = await axios.post(
        `${endpoint}/action/findOne`,
        { dataSource: 'ACIM', database: 'ACIM', collection },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setDb(collection, res.data?.document);
    }
  };

  const writeDb = useCallback(
    async (collection, data) => {
      console.log('writeDB', collection, data);
      if (accessToken) {
        const res = await axios.post(
          `${endpoint}/action/updateOne`,
          { dataSource: 'ACIM', database: 'ACIM', collection, filter: { _id: data._id }, update: data },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setDb(collection, data);
      }
    },
    [accessToken],
  );

  const { writeDbContent, writeDbHighlight, writeDbSettings, writeDbTranslation } = useMemo(
    () => ({
      writeDbContent: async data => writeDb(Collections.Content, data),
      writeDbHighlight: async data => writeDb(Collections.Highlight, data),
      writeDbSettings: async data => writeDb(Collections.Settings, data),
      writeDbTranslation: async data => writeDb(Collections.Translation, data),
    }),
    [writeDb],
  );

  useUpdateEffect(() => {
    if (accessToken && !isInitialized) {
      const init = async () => {
        const db = [Collections.Settings, Collections.Highlight, Collections.Translation, Collections.Content];
        await Promise.all(db.map(collection => readDB(collection)));
        setTimeout(() => updateAccessToken(), accessTokenExp);
        setIsInitialized(true);
      };
      init();
    }
  }, [accessToken, isInitialized]);

  useEffect(() => {
    login();
  }, []);

  return {
    ready: Boolean(isInitialized),
    dbCentent,
    dbHighlight,
    dbSettings,
    dbTranslation,
    writeDbContent,
    writeDbHighlight,
    writeDbSettings,
    writeDbTranslation,
  };
}
