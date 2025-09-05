// app.config.js
export default ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,
    apiUrl: process.env.API_URL,
    androidClientId: config.extra.androidClientId,
  },

  plugins: [
    // All other plugins
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/yasonwelcome.png",
        imageWidth: 150,
        resizeMode: "contain",
        backgroundColor: "#445399",
      },
    ],
    ["@maplibre/maplibre-react-native"],
    "expo-build-properties",
    "expo-dev-client",
    "expo-web-browser",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.695565842419-h0mkml2u8ebddcdf2cn144u59pr8h2qe",
      },
    ],
  ],
});
