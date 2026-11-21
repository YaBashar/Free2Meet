/**
 * FormAlert
 *
 * Message for a form-level error that no single field owns, such as an API
 * rejection. Field-level validation belongs to `FormField`.
 */

import { StyleSheet, Text } from "react-native";

import { COLORS, FONTS } from "@/lib/theme";

/** Renders an error message, or nothing when there is no message. */
function FormAlert({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <Text accessibilityRole="alert" style={styles.text}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.destructive,
    fontFamily: FONTS.regular,
  },
});

export { FormAlert };
