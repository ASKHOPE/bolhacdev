import React, { createContext, useContext } from 'react';
import { useAuth0, User as Auth0User, AppState, Auth0ContextInterface } from '@auth0/auth0-react';

// Define a namespace for custom claims. Replace with your actual namespace.
const ROLES_CLAIM_NAMESPACE = 'https://your-app-namespace.com/roles';

interface AuthContextType {
  user: Auth0User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (options?: { screen_hint: string }) => Promise<void>;
  signIn: (options?: any) => Promise<void>; // Options can be AppState or RedirectLoginOptions
  signOut: (options?: any) => Promise<void>; // Options can be LogoutOptions
  resetPassword: () => void; // Simplified for now
  isAdmin: boolean;
  getAccessTokenSilently: (options?: any) => Promise<string>;
  error?: Error;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error,
  }: Auth0ContextInterface<Auth0User> = useAuth0<Auth0User>();

  const signUp = async (options?: { screen_hint: string }) => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: options?.screen_hint || 'signup',
      },
    });
  };

  const signIn = async (options?: AppState) => {
    await loginWithRedirect(options);
  };

  const signOut = async (options?: any) => { // LogoutOptions type is complex, using any for now
    await logout({
      logoutParams: { returnTo: window.location.origin },
      ...options,
    });
  };

  const resetPassword = () => {
    // This typically involves redirecting to a page or using Auth0's Universal Login.
    // For now, guide the user or trigger a redirect if your Auth0 setup supports it.
    // Example: loginWithRedirect({ authorizationParams: { screen_hint: 'reset_password' } });
    // Or, provide instructions to the user.
    alert('Please use the password reset option on the login page.');
  };

  const isAdmin = React.useMemo(() => {
    if (!user || !user[ROLES_CLAIM_NAMESPACE]) {
      return false;
    }
    const roles = user[ROLES_CLAIM_NAMESPACE] as string[];
    return roles.includes('admin');
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    getAccessTokenSilently,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}