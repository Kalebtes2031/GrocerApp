import { useColorScheme } from "@/hooks/useColorScheme.web";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading = false,
}) => {
  // You can optionally use the colorScheme to adjust styles
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      style={{
        backgroundColor: "#445399",
        height: 42,
        borderRadius: 32,
        width: 304,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        opacity: isLoading ? 0.6 : 1,
      }}
      className={`${containerStyles}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '700',
          }}
          className={`font-league-spartan text-lg ${textStyles}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
