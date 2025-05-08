// app.config.js
export default ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,
    apiUrl: "https://yasonbackend.yasonsc.com",
  },

  plugins: [
    // 1. Pin your Android build properties so Kotlin/SafeAreaContext compile correctly
    
    

    // 2. All your other plugins
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/yasonlogo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-build-properties",
    "expo-dev-client",
    [
      "@rnmapbox/maps",
      {
        "RNMapboxMapsVersion": "10.16.2",
        "RNMapboxMapsDownloadToken": "sk.eyJ1IjoiYW5kdWFsZW1hY3RpdmUiLCJhIjoiY21hMjBiM2piMjc5YTJxczc5YjJodnR1eCJ9.HwvUBWRoj3Sj9q9Zhsg0iA"
      }
    ],
    [
      "expo-location",
      {
        "locationWhenInUsePermission": "Allow map display when in use"
      }
    ]
  ],
});
