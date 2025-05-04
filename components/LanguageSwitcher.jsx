import i18n from "../i18n";
import { TouchableOpacity, Text } from "react-native";

const LanguageSwitcher = () => {
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Save preference to AsyncStorage if needed
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => changeLanguage('en')}>
        <Text>English</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeLanguage('amh')}>
        <Text>አማርኛ</Text>
      </TouchableOpacity>
    </View>
  );
};