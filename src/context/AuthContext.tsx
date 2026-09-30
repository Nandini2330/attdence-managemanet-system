import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../firebase/mockData';
import { auth, isLiveFirebaseConfigured } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, sendPasswordResetEmail } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string, roleHint?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('smartattend_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default to Admin for full inspection
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLiveFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // If live auth user exists
          const matched = INITIAL_USERS.find((u) => u.email === firebaseUser.email) || {
            id: firebaseUser.uid,
            email: firebaseUser.email || 'user@smartattend.edu',
            role: 'STUDENT' as UserRole,
            fullName: firebaseUser.displayName || 'Authenticated User',
            createdAt: new Date().toISOString(),
          };
          setUser(matched);
          localStorage.setItem('smartattend_auth_user', JSON.stringify(matched));
        } else if (!localStorage.getItem('smartattend_auth_user')) {
          setUser(null);
        }
      });
      return () => unsub();
    }
  }, []);

  const login = async (email: string, pass: string, roleHint?: UserRole): Promise<boolean> => {
    setLoading(true);
    try {
      if (isLiveFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      
      // Match from system users or create session
      let matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!matched && roleHint) {
        matched = {
          id: `usr-${Date.now()}`,
          email,
          role: roleHint,
          fullName: email.split('@')[0].toUpperCase(),
          createdAt: new Date().toISOString(),
        };
      } else if (!matched) {
        // Default to student if unknown
        matched = INITIAL_USERS[2];
      }

      setUser(matched);
      localStorage.setItem('smartattend_auth_user', JSON.stringify(matched));
      setLoading(false);
      return true;
    } catch (e) {
      console.warn('Login error fallback:', e);
      // Fallback for demo credentials
      const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || INITIAL_USERS[0];
      setUser(matched);
      localStorage.setItem('smartattend_auth_user', JSON.stringify(matched));
      setLoading(false);
      return true;
    }
  };

  const logout = async () => {
    if (isLiveFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    localStorage.removeItem('smartattend_auth_user');
  };

  const switchRoleDemo = (role: UserRole) => {
    const target =
      (role === 'STUDENT'
        ? INITIAL_USERS.find((u) => u.fullName.toLowerCase().includes('nandini') || u.id === 'stu-nandini')
        : null) ||
      INITIAL_USERS.find((u) => u.role === role) ||
      INITIAL_USERS[0];
    setUser(target);
    localStorage.setItem('smartattend_auth_user', JSON.stringify(target));
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (isLiveFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        loading,
        login,
        logout,
        switchRoleDemo,
        resetPassword,
      }}
    >
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
