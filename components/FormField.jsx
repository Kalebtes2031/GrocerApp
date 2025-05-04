import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();

  const inputStyle = {
    flex: 1,
    color: colorScheme === "dark" ? "#000" : "black",
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 12,
  };

  // If the title is "Password", render either a secure or non-secure input
  const renderPasswordInput = () => {
    if (showPassword) {
      return (
        <TextInput
          style={inputStyle}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={false}
          autoCorrect={false}
          autoCapitalize="none"
          {...props}
        />
      );
    } else {
      return (
        <TextInput
          style={inputStyle}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={true}
          autoCorrect={false}
          autoCapitalize="none"
          {...props}
        />
      );
    }
  };

  return (
    <View style={{ gap: 4, paddingVertical: 8 }} className={`${otherStyles}`}>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 35,
          borderWidth: 1,
          borderColor: "#445399",
          width: "100%",
          height: 58,
          paddingHorizontal: 4,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title === "Password" ? (
          renderPasswordInput()
        ) : (
          <TextInput
            style={inputStyle}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7B7B8B"
            onChangeText={handleChangeText}
            {...props}
          />
        )}

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                !showPassword
                  ? require("@/assets/icons/eye.png")
                  : require("@/assets/icons/eye-hide.png")
              }
              style={{
                width: 24,
                height: 24,
                marginRight: 12,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
