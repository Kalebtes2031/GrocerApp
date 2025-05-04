import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, removeTokens, USER_PROFILE } from "@/hooks/useFetch";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAccessToken();
        console.log("Retrieved token:", token); // Debug log
        // const users = await AsyncStorage.getItem("user");
        console.log("Retrieved user:", user); // Debug log
        if (token) {
          setIsLogged(true);
          const profile = await USER_PROFILE();
          // console.log("Customer Profile:", profile);
          setUser(profile);
          // console.log('from now user is:():', user)
          // setUser(user);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      removeTokens();
      setUser(null);
      setIsLogged(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  console.log("i am the user::", user);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        logout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
