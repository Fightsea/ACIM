import { useState, useCallback, useEffect } from 'react';
import { useUpdateEffect } from 'react-use';
import axios from 'axios';

const apiKey = '';
const appId = '';
const baseUrl = `https://services.cloud.mongodb.com/api/client/v2.0`;
const baseAppUrl = `${baseUrl}/app/${appId}`;
const endpoint = `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1`;
const accessTokenExp = 1800000; // 30 mins

const Collections = {
  Content: 'Content',
  Settings: 'Settings',
};

export default function useMongoDB() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [dbCentent, setDbCentent] = useState(null);
  const [dbSettings, setDbSettings] = useState(null);

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
      return await axios.post(
        `${endpoint}/action/findOne`,
        { dataSource: 'ACIM', database: 'ACIM', collection },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    }
  };

  const writeDb = useCallback(
    async (collection, data, partialUpdate = false) => {
      const update = partialUpdate ? { $inc: data } : data;
      console.log('writeDB', collection, update);
      if (accessToken) {
        const res = await axios.post(
          `${endpoint}/action/updateOne`,
          { dataSource: 'ACIM', database: 'ACIM', collection, filter: { _id: data._id }, update },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (collection === Collections.Content) {
          setDbCentent(data);
        } else if (collection === Collections.Settings) {
          setDbSettings(data);
        }
      }
    },
    [accessToken],
  );

  const writeDbContent = useCallback(async (data, partialUpdate = false) => writeDb(Collections.Content, data, partialUpdate), [writeDb]);
  const writeDbSettings = useCallback(async (data, partialUpdate = false) => writeDb(Collections.Settings, data, partialUpdate), [writeDb]);

  useUpdateEffect(() => {
    if (accessToken && !isInitialized) {
      setIsInitialized(true);
      setTimeout(() => updateAccessToken(), accessTokenExp);

      const init = async () => {
        let res = await readDB(Collections.Content);
        setDbCentent(res.data?.document);
        res = await readDB(Collections.Settings);
        setDbSettings(res.data?.document);
      };
      init();
    }
  }, [accessToken, isInitialized]);

  useEffect(() => {
    login();
  }, []);

  return { dbCentent, dbSettings, writeDbContent, writeDbSettings };
}
