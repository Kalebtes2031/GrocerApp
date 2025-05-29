// LanguageToggle.jsx
import React, { useContext } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LanguageContext } from '@/context/LanguageProvider';


const LanguageToggle = ({bgcolor, textcolor}) => {
  const { currentLanguage, toggleLanguage } = useContext(LanguageContext);

  return (
    <TouchableOpacity onPress={toggleLanguage} style={{ flexDirection: "row" }}>
      <View style={{ backgroundColor: bgcolor , borderTopLeftRadius: 10, borderBottomLeftRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ 
            color: "#fff", 
            fontSize: 12 }}>
          {currentLanguage === "EN" ? "EN" : "አማ"}
        </Text>
      </View>
      <View style={{ backgroundColor:"#fff", borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ color: textcolor, fontSize: 12 }}>
          {currentLanguage === "EN" ? "አማ" : "EN"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
