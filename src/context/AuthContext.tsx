import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_PROFILE: UserProfile = {
  uid: 'admin-user',
  name: 'مدير النظام',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // حاول تسجيل الدخول المجهول ليكون هناك جلسة نشطة للقواعد الأمنية
    const login = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Anonymous login failed. Make sure it's enabled in Firebase Console.", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    login();
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: MOCK_PROFILE, 
      loading, 
      isAdmin: true 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
