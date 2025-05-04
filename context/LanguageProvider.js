// LanguageProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  // Initialize with default value 'EN'
  const [currentLanguage, setCurrentLanguage] = useState("EN");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem("language");
        if (storedLang) {
          // Set the UI state based on stored language code
          setCurrentLanguage(storedLang === "en" ? "EN" : "AM");
          i18n.changeLanguage(storedLang);
        }
      } catch (error) {
        console.error("Error retrieving language from storage:", error);
      }
    };
    loadLanguage();
  }, []);

  const toggleLanguage = async () => {
    const newLangCode = currentLanguage === "EN" ? "amh" : "en"; // Use "amh" for Amharic
    const newState = currentLanguage === "EN" ? "AM" : "EN";
    setCurrentLanguage(newState);
    i18n.changeLanguage(newLangCode);
    try {
      await AsyncStorage.setItem("language", newLangCode);
    } catch (error) {
      console.error("Error saving language to storage:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
