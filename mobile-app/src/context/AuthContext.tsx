import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  sendOtp: (name: string, email: string, pass: string, role: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const decodeJwtPayload = (jwtToken: string) => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT payload', e);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('user_token');
        if (storedToken) {
          const payload = decodeJwtPayload(storedToken);
          if (payload) {
            setUser({
              id: payload.id || 'user_1',
              email: payload.sub,
              name: payload.name || 'User',
              role: payload.role || 'student',
              profile_picture: payload.profile_picture || null,
            });
            setToken(storedToken);
          } else {
            await SecureStore.deleteItemAsync('user_token');
          }
        }
      } catch (err) {
        console.error('Error initializing native auth:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', pass);

    const res = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const access_token = res.data.access_token;
    await SecureStore.setItemAsync('user_token', access_token);
    setToken(access_token);

    const payload = decodeJwtPayload(access_token);
    const loggedUser: User = {
      id: payload?.id || 'user_1',
      email: payload?.sub || email,
      name: payload?.name || 'User',
      role: payload?.role || 'student',
      profile_picture: payload?.profile_picture || null,
    };
    setUser(loggedUser);
    return loggedUser;
  };

  const sendOtp = async (name: string, email: string, pass: string, role: string) => {
    const res = await apiClient.post('/auth/send-otp', { name, email, password: pass, role });
    return res.data;
  };

  const verifyOtp = async (email: string, otp: string): Promise<User> => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    const access_token = res.data.access_token;
    await SecureStore.setItemAsync('user_token', access_token);
    setToken(access_token);

    const payload = decodeJwtPayload(access_token);
    const verifiedUser: User = {
      id: payload?.id || 'user_1',
      email: payload?.sub || email,
      name: payload?.name || 'User',
      role: payload?.role || 'student',
      profile_picture: payload?.profile_picture || null,
    };
    setUser(verifiedUser);
    return verifiedUser;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put('/auth/update-profile', data);
    const updatedUser = { ...user, ...res.data } as User;
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, sendOtp, verifyOtp, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
