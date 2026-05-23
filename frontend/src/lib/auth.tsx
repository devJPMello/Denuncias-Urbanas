import { createContext, useContext, type ReactNode } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';

interface AuthState {
  isSignedIn: boolean;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthState>({ isSignedIn: false, isLoaded: true });

export const useAppAuth = () => useContext(AuthContext);

export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const CLERK_ENABLED =
  typeof CLERK_KEY === 'string' &&
  CLERK_KEY.length > 20 &&
  (CLERK_KEY.startsWith('pk_test_') || CLERK_KEY.startsWith('pk_live_'));

function ClerkAuthSync({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  return (
    <AuthContext.Provider value={{ isSignedIn: !!isSignedIn, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AppAuthProvider({ children }: { children: ReactNode }) {
  if (CLERK_ENABLED) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY}>
        <ClerkAuthSync>{children}</ClerkAuthSync>
      </ClerkProvider>
    );
  }
  return (
    <AuthContext.Provider value={{ isSignedIn: false, isLoaded: true }}>
      {children}
    </AuthContext.Provider>
  );
}
