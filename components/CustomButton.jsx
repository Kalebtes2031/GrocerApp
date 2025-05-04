import { useColorScheme } from "@/hooks/useColorScheme.web";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}) => {
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{ 
        backgroundColor: "#445399",
        height: 62,
        borderRadius: 32,
        width: 304,
      }}
      className={` flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <Text 
      style={{
        color: 'white',
        fontSize: 16,
        fontWeight: 700,
      }}
      className={`font-league-spartan text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;