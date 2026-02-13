import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storeAPI } from '../services/api';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await storeAPI.getAll();
      const mapped = data.map((s) => ({
        id: s._id,
        name: s.name,
        marketplace: 'kaspi',
        botStatus: s.isStarted ? 'paid' : 'unpaid',
        expireDate: s.expireDate,
        productsCount: 0,
        ...s,
      }));
      setStores(mapped);
      if (mapped.length > 0 && !activeStore) {
        setActiveStore(mapped[0]);
      }
    } catch (err) {
      // Token may be invalid or API not available
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStores();
    } else {
      setStores([]);
      setActiveStore(null);
    }
  }, [isAuthenticated, fetchStores]);

  const addTestStore = useCallback(async () => {
    try {
      const { data } = await storeAPI.createTest();
      await fetchStores();
      return data;
    } catch (err) {
      throw err;
    }
  }, [fetchStores]);

  const deleteStore = useCallback(async (id) => {
    try {
      await storeAPI.delete(id);
      await fetchStores();
    } catch (err) {
      console.error('Failed to delete store:', err);
      // Fallback: remove locally
      setStores((prev) => prev.filter((s) => s.id !== id));
      if (activeStore?.id === id) {
        setStores((prev) => {
          const remaining = prev.filter((s) => s.id !== id);
          setActiveStore(remaining[0] || null);
          return remaining;
        });
      }
    }
  }, [activeStore, fetchStores]);

  return (
    <StoreContext.Provider value={{
      stores, activeStore, setActiveStore,
      addTestStore, deleteStore, fetchStores, loading,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
