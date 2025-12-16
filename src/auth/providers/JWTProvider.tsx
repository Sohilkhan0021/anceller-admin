/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type UserModel } from '@/auth';
import { API_URL } from '@/config/api.config';

export const LOGIN_URL = `${API_URL}/auth/admin/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/user`;
// Alternative user endpoint patterns to try
const USER_ENDPOINTS = [
  `${API_URL}/user`,
  `${API_URL}/auth/user`,
  `${API_URL}/auth/me`,
  `${API_URL}/users/me`,
  `${API_URL}/profile`
];

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  register: (email: string, password: string, password_confirmation: string) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  const verify = async () => {
    if (auth) {
      try {
        const { data: user } = await getUser();
        setCurrentUser(user);
      } catch (error: any) {
        // Only clear auth if token is invalid (401 Unauthorized)
        // For 404 or other errors, keep auth but clear user data
        if (error?.response?.status === 401) {
          // Token is invalid, clear auth
          saveAuth(undefined);
          setCurrentUser(undefined);
        } else {
          // Endpoint doesn't exist or other error, but token might still be valid
          // Keep auth but clear user data
          setCurrentUser(undefined);
          console.debug('User endpoint not available during verify, keeping auth');
        }
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Prepare request payload - some APIs might expect 'username' instead of 'email'
      const requestPayload = {
        email,
        password
      };
      
      console.log('Login request:', {
        url: LOGIN_URL,
        payload: { ...requestPayload, password: '***' } // Don't log actual password
      });
      
      const response = await axios.post(LOGIN_URL, requestPayload);
      
      // Handle different possible response formats
      let authData: AuthModel;
      const responseData = response.data;
      
      // Check if response has nested data or direct fields
      if (responseData.data) {
        authData = responseData.data;
      } else if (responseData.access_token || responseData.token) {
        // Handle different token field names
        authData = {
          access_token: responseData.access_token || responseData.token,
          api_token: responseData.api_token || responseData.access_token || responseData.token,
          refreshToken: responseData.refreshToken || responseData.refresh_token
        };
      } else {
        authData = responseData as AuthModel;
      }
      
      saveAuth(authData);
      
      // Check if login response already contains user data
      let userData: UserModel | undefined;
      if (responseData.user || responseData.data?.user) {
        userData = responseData.user || responseData.data.user;
        setCurrentUser(userData);
      } else {
        // Try to get user from API, but don't fail if endpoint doesn't exist
        try {
          const { data: user } = await getUser();
          setCurrentUser(user);
        } catch (userError) {
          // Silently continue without user data if endpoint doesn't exist
          // This is expected if the backend doesn't provide a user endpoint
          console.debug('User endpoint not available, continuing without user data');
        }
      }
    } catch (error: any) {
      saveAuth(undefined);
      // Extract error message from API response
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.response?.data?.errors?.message ||
                          (typeof error?.response?.data === 'string' ? error.response.data : null) ||
                          error?.message || 
                          'Login failed. Please try again.';
      console.error('Login error details:', {
        url: LOGIN_URL,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        headers: error?.response?.headers,
        message: errorMessage
      });
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, password_confirmation: string) => {
    try {
      const { data: auth } = await axios.post(REGISTER_URL, {
        email,
        password,
        password_confirmation
      });
      saveAuth(auth);
      // Try to get user, but don't fail if endpoint doesn't exist
      try {
        const { data: user } = await getUser();
        setCurrentUser(user);
      } catch (userError) {
        // Silently continue without user data if endpoint doesn't exist
        console.debug('User endpoint not available after registration, continuing without user data');
      }
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email
    });
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
  };

  const getUser = async () => {
    // Try multiple endpoint patterns in case the API uses a different path
    let lastError: any;
    
    for (const endpoint of USER_ENDPOINTS) {
      try {
        const response = await axios.get<UserModel>(endpoint);
        return response;
      } catch (error: any) {
        lastError = error;
        // If it's a 404, try the next endpoint
        if (error?.response?.status === 404 && endpoint !== USER_ENDPOINTS[USER_ENDPOINTS.length - 1]) {
          continue;
        }
        // For other errors or if this is the last endpoint, throw
        throw error;
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError;
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
