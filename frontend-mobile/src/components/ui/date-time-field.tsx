/**
 * DateTimeField
 *
 * Labelled control that opens the native date or time picker on press and
 * stores the selection as a `Date` (or null).
 */

import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { COLORS, FONTS } from "@/lib/theme";

type DateTimeFieldProps = {
  label: string;
  mode: "date" | "time";
  value: Date | null;
  onChange: (value: Date) => void;
  error?: string;
  minimumDate?: Date;
};

/** Renders a labelled date or time picker with its validation message. */
function DateTimeField({ label, mode, value, onChange, error, minimumDate }: DateTimeFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value
    ? mode === "date"
      ? value.toLocaleDateString()
      : value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : `Select a ${mode}`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={[styles.field, error ? styles.fieldError : null]}
      >
        <Text style={styles.value}>{displayValue}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isOpen ? (
        <>
          <DateTimePicker
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minimumDate}
            mode={mode}
            onDismiss={() => setIsOpen(false)}
            onValueChange={(_event, selected) => {
              // The Android dialog closes itself; iOS stays open until Done.
              if (Platform.OS === "android") {
                setIsOpen(false);
              }
              onChange(selected);
            }}
            value={value ?? new Date()}
          />
          {Platform.OS === "ios" ? (
            <Button onPress={() => setIsOpen(false)} variant="link">
              Done
            </Button>
          ) : null}
        </>
      ) : null}
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
  field: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  fieldError: {
    borderColor: COLORS.destructive,
  },
  value: {
    color: COLORS.foreground,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  error: {
    color: COLORS.destructive,
    fontFamily: FONTS.regular,
  },
});

export { DateTimeField };
