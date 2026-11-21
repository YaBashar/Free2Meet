/**
 * Button
 *
 * Themed `Pressable` in three looks: a filled primary action, an outlined
 * secondary action, and an inline text link. Callers pass `onPress`.
 */

import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { COLORS, FONTS } from "@/lib/theme";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: string;
  variant?: "primary" | "outline" | "link";
  style?: StyleProp<ViewStyle>;
};

/** Renders a themed pressable with a text label. */
function Button({ children, variant = "primary", disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      {...props}
    >
      <Text style={[styles.text, variant === "primary" && styles.primaryText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  link: {
    padding: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  primaryText: {
    color: COLORS.primaryForeground,
  },
});

export { Button };
