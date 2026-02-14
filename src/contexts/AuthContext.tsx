import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Database } from '../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];

interface AppContextType {
  coupleId: string | null;
  couple: Couple | null;
  loading: boolean;
  setCoupleId: (id: string) => void;
  setCouple: (couple: Couple) => void;
  clearCoupleId: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [coupleId, setCoupleIdState] = useState<string | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('coupleId');
    if (saved) {
      setCoupleIdState(saved);
    }
    setLoading(false);
  }, []);

  const setCoupleId = (id: string) => {
    setCoupleIdState(id);
    localStorage.setItem('coupleId', id);
  };

  const clearCoupleId = () => {
    setCoupleIdState(null);
    setCouple(null);
    localStorage.removeItem('coupleId');
  };

  return (
    <AppContext.Provider
      value={{
        coupleId,
        couple,
        loading,
        setCoupleId,
        setCouple,
        clearCoupleId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
