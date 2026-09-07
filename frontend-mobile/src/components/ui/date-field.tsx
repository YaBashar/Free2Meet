/**
 * DateField
 *
 * Labelled calendar date control that matches FormField chrome. Stores a
 * `Date` (or null) and opens the platform native date picker on press.
 */

import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  /** Validation message shown under the field. Also styles the error border. */
  error?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Renders a labelled calendar picker with its validation message. */
function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = "Select a date",
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const { primary, mutedForeground } = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="font-outfit-medium text-sm text-foreground">{label}</Text>

      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        className={cn(
          "h-12 justify-center rounded-xl border border-border bg-card px-4",
          isOpen && "border-2 border-ring",
          error && "border-2 border-destructive",
        )}
        onPress={() => setIsOpen((open) => !open)}
      >
        <Text
          className={cn(
            "font-outfit text-base",
            value ? "text-foreground" : "text-muted-foreground",
          )}
          style={!value ? { color: mutedForeground } : undefined}
        >
          {value ? formatDateLabel(value) : placeholder}
        </Text>
      </Pressable>

      {error ? (
        <Text className="font-outfit text-xs text-destructive">{error}</Text>
      ) : null}

      {isOpen ? (
        <View className="overflow-hidden rounded-xl bg-card">
          <DateTimePicker
            accentColor={primary}
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            mode="date"
            onDismiss={() => setIsOpen(false)}
            onValueChange={(_event, selected) => {
              // Android closes itself after a choice; keep iOS open until Done.
              if (Platform.OS === "android") {
                setIsOpen(false);
              }
              onChange(selected);
            }}
            value={value ?? minimumDate ?? new Date()}
          />

          {Platform.OS === "ios" ? (
            <Pressable
              accessibilityLabel="Done selecting date"
              accessibilityRole="button"
              className="items-end px-4 pb-3"
              onPress={() => setIsOpen(false)}
            >
              <Text className="font-outfit-medium text-base text-primary">Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export { DateField };
export type { DateFieldProps };
