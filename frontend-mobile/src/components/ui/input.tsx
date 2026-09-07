/**
 * Input
 *
 * Themed `TextInput` with focus and error styling for NativeWind. Does not
 * own labels, validation, or error copy — see `FormField`.
 */

import { useState, type Ref } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

type InputProps = TextInputProps & {
  /** Draws the error outline. The message itself is rendered by the caller. */
  hasError?: boolean;
  ref?: Ref<TextInput>;
};

/** Renders a bordered text field that reflects focus and error state. */
function Input({ className, hasError = false, onBlur, onFocus, ...props }: InputProps) {
  const { mutedForeground } = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      className={cn(
        "h-12 rounded-xl border border-border bg-card px-4 font-outfit text-base text-foreground",
        isFocused && "border-2 border-ring",
        hasError && "border-2 border-destructive",
        className,
      )}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      placeholderTextColor={mutedForeground}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
