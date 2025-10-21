import React from "react";
import {
  Pressable,
  PressableProps,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";

export const CustomButton: React.FC<
  PressableProps & { style?: StyleProp<ViewStyle> }
> = ({ children, style, ...rest }) => (
  <Pressable
    {...rest}
    android_ripple={
      Platform.OS === "android"
        ? { color: "rgba(255,255,255,0.3)", borderless: false }
        : undefined
    }
    style={({ pressed }) => [
      style,
      Platform.OS === "ios" && pressed && { opacity: 0.85 },
    ]}
  >
    {children}
  </Pressable>
);
