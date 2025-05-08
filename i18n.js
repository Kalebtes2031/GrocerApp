import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translation files
const resources = {
  en: {
    welcome: require("@/languages/eng/welcome.json"),
    home: require("@/languages/eng/home.json"),
    card: require("@/languages/eng/card.json"),
    categorydetail: require("@/languages/eng/categorydetail.json"),
    category: require("@/languages/eng/category.json"),
    tabs: require("@/languages/eng/tabs.json"),
    shop: require("@/languages/eng/shop.json"),
    cartscreen: require("@/languages/eng/cartscreen.json"),
    checkout: require("@/languages/eng/checkout.json"),
    directpayment: require("@/languages/eng/directpayment.json"),
    schedule: require("@/languages/eng/schedule.json"),
    carddetail: require("@/languages/eng/carddetail.json"),
    orderinfo: require("@/languages/eng/orderinfo.json"),
    order: require("@/languages/eng/order.json"),
    header: require("@/languages/eng/header.json"),
    watchlist: require("@/languages/eng/watchlist.json"),
    signup: require("@/languages/eng/signup.json"),
    signin: require("@/languages/eng/signin.json"),
    track: require("@/languages/eng/track.json"),
    profile: require("@/languages/eng/profile.json"),
    forgot: require("@/languages/eng/forgot.json"),
    otpverify: require("@/languages/eng/otpverify.json"),
    newpass: require("@/languages/eng/newpass.json"),
  },
  amh: {
    welcome: require("@/languages/amh/welcome.json"),
    home: require("@/languages/amh/home.json"),
    card: require("@/languages/amh/card.json"),
    categorydetail: require("@/languages/amh/categorydetail.json"),
    category: require("@/languages/amh/category.json"),
    tabs: require("@/languages/amh/tabs.json"),
    shop: require("@/languages/amh/shop.json"),
    cartscreen: require("@/languages/amh/cartscreen.json"),
    checkout: require("@/languages/amh/checkout.json"),
    directpayment: require("@/languages/amh/directpayment.json"),
    schedule: require("@/languages/amh/schedule.json"),
    carddetail: require("@/languages/amh/carddetail.json"),
    orderinfo: require("@/languages/amh/orderinfo.json"),
    order: require("@/languages/amh/order.json"),
    header: require("@/languages/amh/header.json"),
    watchlist: require("@/languages/amh/watchlist.json"),
    signup: require("@/languages/amh/signup.json"),
    signin: require("@/languages/amh/signin.json"),
    track: require("@/languages/amh/track.json"),
    profile: require("@/languages/amh/profile.json"),
    forgot: require("@/languages/amh/forgot.json"),
    otpverify: require("@/languages/amh/otpverify.json"),
    newpass: require("@/languages/amh/newpass.json"),
  },
};

const fallback = { languageTag: "amh", isRTL: false };
let languageTag = fallback.languageTag;
let RNLocalize;

try {
  // Dynamically require RNLocalize so that if it isn’t linked, we catch the error.
  RNLocalize = require("react-native-localize");
  const bestLanguage = RNLocalize.findBestAvailableLanguage(Object.keys(resources));
  languageTag = bestLanguage ? bestLanguage.languageTag : fallback.languageTag;
} catch (error) {
  console.warn("RNLocalize not available, falling back to default language", error);
  languageTag = fallback.languageTag;
}

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3", // For React Native compatibility
    resources,
    lng: languageTag,
    fallbackLng: "amh",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
