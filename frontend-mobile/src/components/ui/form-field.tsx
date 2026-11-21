/**
 * FormField
 *
 * Pairs a label, themed text input, and validation message so forms stay
 * consistent. Validation itself belongs to the screen.
 */

import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { COLORS, FONTS } from "@/lib/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  /** Validation message shown under the field. */
  error?: string;
};

/** Renders a labelled text field with its validation message. */
function FormField({ label, error, ...props }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={COLORS.mutedForeground}
        style={[styles.input, error ? styles.inputError : null]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: COLORS.foreground,
    fontFamily: FONTS.medium,
  },
  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.foreground,
    fontFamily: FONTS.regular,
    fontSize: 16,
    padding: 12,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },
  error: {
    color: COLORS.destructive,
    fontFamily: FONTS.regular,
  },
});

export { FormField };
export type { FormFieldProps };
