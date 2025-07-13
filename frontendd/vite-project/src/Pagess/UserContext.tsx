// Pagess/UserContext.tsx
import React, { createContext, useState, useEffect } from 'react';

// Add 'photo' field to the UserType interface
interface UserType {
  name: string;
  password: string;
  role: string;
  photo?: string; // optional, base64 or URL
  _id?: string;    // include _id if you're using MongoDB's _id in login
}

interface UserContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //  Initialize from localStorage
  const [user, setUser] = useState<UserType | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
