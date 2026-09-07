/**
 * FormAlert
 *
 * Banner for a form-level message that no single field owns, such as an API
 * rejection. Field-level validation belongs to `FormField`.
 */

import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

type FormAlertProps = {
  message: string;
  /** `error` reports a failure; `success` confirms a completed action. */
  tone?: "error" | "success";
  className?: string;
};

/** Renders an outlined message block beside a form. */
function FormAlert({ message, tone = "error", className }: FormAlertProps) {
  const isError = tone === "error";

  return (
    <View
      accessibilityRole="alert"
      className={cn(
        "rounded-xl border bg-card px-4 py-3",
        isError ? "border-destructive" : "border-primary",
        className,
      )}
    >
      <Text
        className={cn("font-outfit text-sm", isError ? "text-destructive" : "text-foreground")}
      >
        {message}
      </Text>
    </View>
  );
}

export { FormAlert };
export type { FormAlertProps };
