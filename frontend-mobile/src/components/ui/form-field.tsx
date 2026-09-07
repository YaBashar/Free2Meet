/**
 * FormField
 *
 * Pairs a label, themed input, and validation message so forms stay
 * consistent, and owns the show/hide toggle for password fields. Validation
 * itself belongs to the screen.
 */

import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormFieldProps = InputProps & {
  label: string;
  /** Validation message shown under the field. Also styles the error border. */
  error?: string;
};

/** Renders a labelled text field with its validation message. */
function FormField({
  label,
  error,
  secureTextEntry = false,
  className,
  ...props
}: FormFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="font-outfit-medium text-sm text-foreground">{label}</Text>

      <View>
        <Input
          accessibilityLabel={label}
          // Leave room for the reveal toggle so long passwords stay readable.
          className={cn(secureTextEntry && "pr-20", className)}
          hasError={Boolean(error)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            accessibilityRole="button"
            accessibilityState={{ selected: isPasswordVisible }}
            className="absolute bottom-0 right-1 top-0 justify-center px-3"
            onPress={() => setIsPasswordVisible((visible) => !visible)}
          >
            <Text className="font-outfit-medium text-sm text-primary">
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="font-outfit text-xs text-destructive">{error}</Text>
      ) : null}
    </View>
  );
}

export { FormField };
export type { FormFieldProps };
