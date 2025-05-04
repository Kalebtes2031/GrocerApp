import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    loadWatchlist();
  }, []);

  // Load watchlist from AsyncStorage
  const loadWatchlist = async () => {
    try {
      const storedWatchlist = await AsyncStorage.getItem("watchlist");
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    }
  };

  // Save watchlist to AsyncStorage
  const saveWatchlist = async (newList) => {
    try {
      setWatchlist(newList);
      await AsyncStorage.setItem("watchlist", JSON.stringify(newList));
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  };

 // Check if a product is in the watchlist by its variation id
 const isFavorite = (variationId) => {
  return watchlist.some((item) => item.variation.id === variationId);
};

  
  // Add product to watchlist (using variation id as identifier)
  const addToWatchlist = (product) => {
    if (!isFavorite(product.variation.id)) {
      const updatedList = [...watchlist, product];
      saveWatchlist(updatedList);
    }
  };
  
  
  // Remove product from watchlist by variation id
  const removeFromWatchlist = (variationId) => {
    const updatedList = watchlist.filter((item) => item.variation.id !== variationId);
    saveWatchlist(updatedList);
  };
  
  
  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isFavorite }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

// Custom Hook to use the Watchlist
export const useWatchlist = () => useContext(WatchlistContext);
