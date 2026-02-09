import React, { createContext, useContext, useEffect, useState } from 'react';
import { DCPClient } from '../core/DCPClient';
import { IDCPConfig } from '../interfaces';

const DCPContext = createContext<DCPClient | null>(null);

interface DCPProviderProps {
  client: DCPClient;
  children: React.ReactNode;
}

export const DCPProvider: React.FC<DCPProviderProps> = ({ client, children }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    client.init().then(() => setInit(true));
  }, [client]);

  if (!init) return null; // Or a loading spinner

  return (
    // @ts-ignore - Providing value despite type mismatch with null in strict mode context creation
    // In real app, create proper context with default value or check
    <DCPContext.Provider value={client}>
      {children}
    </DCPContext.Provider>
  );
};

export const useDCP = (): DCPClient => {
  const client = useContext(DCPContext);
  if (!client) {
    throw new Error('useDCP must be used within a DCPProvider');
  }
  return client;
};

export const useDCPQuery = <T,>(key: string) => {
  const client = useDCP();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await client.getStorage().get<T>(key);
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    // Ideally, subscribe to changes here if Storage emitted events
    // client.getStorage().subscribe(key, (newData) => setData(newData));

    return () => {
      mounted = false;
    };
  }, [client, key]);

  return { data, loading, error };
};
