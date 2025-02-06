import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadEntriedUser = async () => {
      try {
        const storedEntUser = await AsyncStorage.getItem('entriedUser');
        if (storedEntUser) {
          setUser(JSON.parse(storedEntUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadEntriedUser();
  }, []);



  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
