import { createContext, useContext, useState } from 'react';

const StoreContext = createContext(null);

const MOCK_STORES = [
  {
    id: 'store_1a2b3c4d',
    name: 'ТОО "TechMarket"',
    marketplace: 'kaspi',
    botStatus: 'paid',
    whatsappStatus: 'connected',
    productsCount: 254,
    createdAt: '2025-09-15',
  },
  {
    id: 'store_5e6f7g8h',
    name: 'ТОО "HomeGoods"',
    marketplace: 'kaspi',
    botStatus: 'paid',
    whatsappStatus: 'not_connected',
    productsCount: 0,
    createdAt: '2025-11-20',
  },
  {
    id: 'store_9i0j1k2l',
    name: 'ИП Султанов',
    marketplace: 'halyk',
    botStatus: 'unpaid',
    whatsappStatus: 'not_connected',
    productsCount: 0,
    createdAt: '2026-01-10',
  },
];

export function StoreProvider({ children }) {
  const [stores, setStores] = useState(MOCK_STORES);
  const [activeStore, setActiveStore] = useState(MOCK_STORES[0]);

  const addStore = (store) => {
    const newStore = {
      ...store,
      id: `store_${Date.now()}`,
      botStatus: 'unpaid',
      whatsappStatus: 'not_connected',
      productsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStores((prev) => [...prev, newStore]);
    return newStore;
  };

  return (
    <StoreContext.Provider value={{ stores, activeStore, setActiveStore, addStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
