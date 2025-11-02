// UserContext.tsx
import { use2FA, useUser } from '@/hooks/apiHooks';
import { AuthContextType, Credentials } from '@/types/LocalTypes';
import { UserWithNoPassword } from '@sharedTypes/DBTypes';
import React, { createContext, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UserContext = createContext<AuthContextType | null>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithNoPassword | null>(null);
  const { postVerify } = use2FA();
  const { getUserByToken } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // login function for 2FA verification
  const handleLogin = async (credentials: Credentials) => {
    try {
      const loginResult = await postVerify(credentials);
      if (loginResult) {
        localStorage.setItem('token', loginResult.token);
        setUser(loginResult.user);
        navigate('/secret');
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // logout function
  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    } catch (e) {
      console.log((e as Error).message);
    }
  }, [navigate]);

  // automatic login based on stored token
  const handleAutoLogin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userResponse = await getUserByToken(token);
        setUser(userResponse.user);
        const origin = location.state?.from?.pathname || '/';
        navigate(origin);
      }
    } catch (e) {
      console.log((e as Error).message);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, handleLogin, handleLogout, handleAutoLogin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
