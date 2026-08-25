import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Seller' | 'Brand' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  verified: boolean;
  avatar: string;
  plan: 'Free Trial' | 'Seller Pro' | 'Brand Shield' | 'Enterprise';
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('Brand');
  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr_brand_101',
    name: 'Sarah Jenkins',
    email: 'sarah@apexgear.tech',
    role: 'Brand',
    companyName: 'ApexGear Tech',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    plan: 'Brand Shield'
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'Seller') {
      setUser({
        id: 'usr_seller_202',
        name: 'Alexander Wright',
        email: 'alex@primewholesale.io',
        role: 'Seller',
        companyName: 'PrimeWholesale Global',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        plan: 'Seller Pro'
      });
    } else if (newRole === 'Brand') {
      setUser({
        id: 'usr_brand_101',
        name: 'Sarah Jenkins',
        email: 'sarah@apexgear.tech',
        role: 'Brand',
        companyName: 'ApexGear Tech',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        plan: 'Brand Shield'
      });
    } else {
      setUser({
        id: 'usr_admin_999',
        name: 'Enterprise Administrator',
        email: 'admin@distributionbridge.ai',
        role: 'Admin',
        companyName: 'Distribution Bridge Platform Governance',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        plan: 'Enterprise'
      });
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const login = (email: string, targetRole: UserRole) => {
    setRole(targetRole);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        login,
        logout,
        isAuthenticated: !!user,
        switchRole
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
