/**
 * FormScreen
 *
 * Shared shell for form screens: sets the header title, keeps fields above the
 * keyboard, scrolls, and spaces its children evenly under a subtitle.
 */

import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";

import { COLORS, FONTS } from "@/lib/theme";

type FormScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

/** Renders a titled, keyboard-aware, scrollable form layout. */
function FormScreen({ title, subtitle, children }: FormScreenProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 24,
  },
  subtitle: {
    color: COLORS.mutedForeground,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
});

export { FormScreen };
