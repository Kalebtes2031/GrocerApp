// app.config.js
export default ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,
    apiUrl: "https://yasonbackend.yasonsc.com",
  },

  plugins: [
    // 1. Pin your Android build properties so Kotlin/SafeAreaContext compile correctly
    "expo-build-properties",
    

    // 2. All your other plugins
    ["expo-router", {}],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/yasonlogo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-dev-client"
  ],
});
