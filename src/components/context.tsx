import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '../domain/types';
import { getService } from '../services';
import { Skeleton } from './ui';
type Auth = { session: Session | null; setSession: (session: Session | null) => void };
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getService()
      .session()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);
  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext)!;
}
