import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/api/authApi';
import { registerPushToken } from '@/lib/pushRegistration';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const { user: currentUser } = await authApi.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
      if (currentUser?.id) registerPushToken(currentUser);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error.status && error.status !== 401) {
        setAuthError({ type: 'unknown', message: error.message });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = async (email, password) => {
    const { user: loggedInUser } = await authApi.login({ email, password });
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setAuthError(null);
    if (loggedInUser?.id) registerPushToken(loggedInUser);
    return loggedInUser;
  };

  const register = async (data) => {
    const { user: newUser } = await authApi.register(data);
    setUser(newUser);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setAuthError(null);
    return newUser;
  };

  const logout = async () => {
    //Stato locale ripulito subito (UI reattiva); la revoca del refresh token lato
    //server avviene in background e non deve bloccare la navigazione post-logout.
    setUser(null);
    setIsAuthenticated(false);
    await authApi.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError,
      login,
      register,
      logout,
      checkUserAuth,
      refreshUser: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
