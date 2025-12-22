import { useContext } from 'react';
import { AuthContext } from './providers/JWTProvider';

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    // Return a default context object instead of throwing
    // This prevents errors when the component is rendered before the provider is ready
    console.warn('useAuthContext called outside AuthProvider, returning default context');
    return {
      loading: false,
      setLoading: () => {},
      auth: undefined,
      saveAuth: () => {},
      currentUser: undefined,
      setCurrentUser: () => {},
      login: async () => {},
      register: async () => {},
      requestPasswordResetLink: async () => {},
      changePassword: async () => {},
      getUser: async () => ({ data: {} } as any),
      logout: () => {},
      verify: async () => {}
    };
  }

  return context;
};
