import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { useWatchlist } from "@/context/WatchlistProvider";

import {
  getAccessToken,
  removeTokens,
  USER_PROFILE,
  GET_AUTH,
  POST_GOOGLE_AUTH,      // ← import your new helper
} from "@/hooks/useFetch";


const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearWatchlist } = useWatchlist(); 

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
        } 
        // else {
        //   setIsLogged(false);
        //   setUser(null);
        // }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

//  const loginWithGoogle = async () => {
//   try {
//     const redirectUri = AuthSession.makeRedirectUri({
//       scheme: "myfreshapp", 
//       useProxy: false,
//     });

//     const discovery = {
//       authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
//     };

//     const [request, response, promptAsync] = AuthSession.useAuthRequest(
//       {
//         clientId: Constants.expoConfig.extra.androidClientId,
//         redirectUri,
//         scopes: ["openid", "profile", "email"],
//         responseType: "id_token",
//       },
//       discovery
//     );

//     const result = await promptAsync();
//     if (result.type !== "success") throw new Error("Google sign-in cancelled");

//     const { id_token } = result.params;

//     const tokens = await POST_GOOGLE_AUTH({ id_token });

//     await AsyncStorage.multiSet([
//       ["accessToken", tokens.access_token],
//       ["refreshToken", tokens.refresh_token],
//     ]);

//     const profile = await USER_PROFILE();
//     setUser(profile);
//     setIsLogged(true);
//     return profile;
//   } catch (error) {
//     console.error("Google login failed:", error);
//     throw error;
//   }
// };


  const logout = async () => {
    try {
      removeTokens();
      setUser(null);
      setIsLogged(false);
      await clearWatchlist();
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
        // loginWithGoogle,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
