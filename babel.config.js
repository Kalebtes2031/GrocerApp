// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
      // 1. Expo Router (transform entry.js)
      'expo-router/babel',

      // 2. NativeWind (Tailwind)
      'nativewind/babel',

      // 3. Reanimated (worklets)
      'react-native-reanimated/plugin',
    ],
  };
};
