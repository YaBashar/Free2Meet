/**
 * VerificationCodeInput
 *
 * Six single-digit fields for email verification codes. Handles focus
 * movement, backspace, and paste. Validation messages belong to the caller.
 */

import { useRef } from "react";
import { TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

const DIGIT_COUNT = 6;

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once all six digits are entered. */
  onComplete?: (value: string) => void;
  hasError?: boolean;
};

/** Renders six digit boxes for a verification code. */
function VerificationCodeInput({
  value,
  onChange,
  onComplete,
  hasError = false,
}: VerificationCodeInputProps) {
  const { mutedForeground } = useThemeColors();
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length: DIGIT_COUNT }, (_, index) => value[index] ?? "");

  function focusInput(index: number) {
    inputs.current[index]?.focus();
  }

  function handleDigitChange(text: string, index: number) {
    const numeric = text.replace(/\D/g, "");

    if (numeric.length > 1) {
      const pasted = numeric.slice(0, DIGIT_COUNT);
      onChange(pasted);

      if (pasted.length === DIGIT_COUNT) {
        onComplete?.(pasted);
        inputs.current[DIGIT_COUNT - 1]?.blur();
      } else {
        focusInput(pasted.length);
      }

      return;
    }

    const nextValue = `${value.slice(0, index)}${numeric}${value.slice(index + 1)}`.slice(
      0,
      DIGIT_COUNT,
    );
    onChange(nextValue);

    if (numeric && index < DIGIT_COUNT - 1) {
      focusInput(index + 1);
    }

    if (nextValue.length === DIGIT_COUNT) {
      onComplete?.(nextValue);
      inputs.current[DIGIT_COUNT - 1]?.blur();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      const nextValue = value.slice(0, index - 1) + value.slice(index);
      onChange(nextValue);
      focusInput(index - 1);
    }
  }

  return (
    <View className="flex-row justify-between gap-2">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          accessibilityLabel={`Verification digit ${index + 1}`}
          className={cn(
            "h-14 flex-1 rounded-xl border border-border bg-card text-center font-outfit-semibold text-xl text-foreground",
            hasError && "border-2 border-destructive",
          )}
          keyboardType="number-pad"
          maxLength={index === 0 ? DIGIT_COUNT : 1}
          onChangeText={(text) => handleDigitChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          placeholder="·"
          placeholderTextColor={mutedForeground}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          returnKeyType="done"
          selectTextOnFocus
          textContentType="oneTimeCode"
          value={digit}
        />
      ))}
    </View>
  );
}

export { VerificationCodeInput, DIGIT_COUNT };
export type { VerificationCodeInputProps };
