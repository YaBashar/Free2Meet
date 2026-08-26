/**
 * Reset password screen
 *
 * Lets a member choose and confirm a new password after their reset code has
 * been verified. Calls `POST /auth/reset-password` and signs the member in on
 * success.
 */

import { router, Stack, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import {
  hasFieldErrors,
  validateResetPasswordForm,
  type ResetPasswordFieldErrors,
  type ResetPasswordFormValues,
} from "@/lib/auth/validation";

const EMPTY_FORM: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};
const FORGOT_PASSWORD_ROUTE = "/screens/forgot-password" as Href;

/** Completes the password reset after the code has been verified. */
export default function ResetPasswordScreen() {
  const { signIn } = useAuth();
  const { primaryForeground } = useThemeColors();
  const confirmPasswordInput = useRef<TextInput>(null);
  const { resetCode: rawResetCode } = useLocalSearchParams<{ resetCode?: string | string[] }>();

  const resetCode = normalizeResetCodeParam(rawResetCode);
  const [values, setValues] = useState<ResetPasswordFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!resetCode) {
      router.replace(FORGOT_PASSWORD_ROUTE);
    }
  }, [resetCode]);

  /** Updates one field without disturbing the others. */
  function handleFieldChange(field: keyof ResetPasswordFormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  /** Validates the form, then exchanges the code for a new password and session. */
  async function handleSubmit() {
    if (!resetCode) {
      router.replace(FORGOT_PASSWORD_ROUTE);
      return;
    }

    if (isSubmitting) {
      return;
    }

    const errors = validateResetPasswordForm(values);
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await resetPassword({
        resetCode,
        newPassword: values.password,
      });
      signIn(session);
      router.replace("/screens/dashboard");
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  if (!resetCode) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Create new password" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-background"
      >
        <ScrollView
          contentContainerClassName="px-6 pb-10 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-outfit text-base text-muted-foreground">
            Enter a new password for your account. You&apos;ll be signed in once it&apos;s updated.
          </Text>

          <View className="mt-8 gap-4">
            <FormField
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              error={fieldErrors.password}
              label="New password"
              onChangeText={(value) => handleFieldChange("password", value)}
              onSubmitEditing={() => confirmPasswordInput.current?.focus()}
              placeholder="Create a new password"
              returnKeyType="next"
              secureTextEntry
              value={values.password}
            />

            <FormField
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              error={fieldErrors.confirmPassword}
              label="Confirm new password"
              onChangeText={(value) => handleFieldChange("confirmPassword", value)}
              onSubmitEditing={handleSubmit}
              placeholder="Re-enter your new password"
              ref={confirmPasswordInput}
              returnKeyType="go"
              secureTextEntry
              value={values.confirmPassword}
            />

            <Text className="font-outfit text-xs text-muted-foreground">
              At least 8 characters, with upper and lower case letters and one special character.
            </Text>
          </View>

          {requestError ? <FormAlert className="mt-4" message={requestError} /> : null}

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            disabled={isSubmitting}
            onPress={handleSubmit}
            size="lg"
          >
            {isSubmitting ? <ActivityIndicator color={primaryForeground} /> : "Reset password"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function normalizeResetCodeParam(value: string | string[] | undefined): string | null {
  const resetCode = Array.isArray(value) ? value[0] : value;
  const trimmed = resetCode?.trim();

  return trimmed ? trimmed : null;
}
