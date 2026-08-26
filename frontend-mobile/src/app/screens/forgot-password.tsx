/**
 * Forgot password screen
 *
 * Collects the account email address, validates it locally, then calls
 * `POST /auth/forgot-password`. The next step always asks for the reset code
 * so the flow does not reveal whether the email exists.
 */

import { router, Stack, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  hasFieldErrors,
  validateForgotPasswordForm,
  type ForgotPasswordFieldErrors,
} from "@/lib/auth/validation";

const FORGOT_PASSWORD_CODE_ROUTE = "/screens/forgot-password-code" as Href;
const LOGIN_ROUTE = "/screens/login" as Href;

/** Starts the reset-password flow from an email address. */
export default function ForgotPasswordScreen() {
  const { primaryForeground } = useThemeColors();
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates the email, then triggers the password reset email. */
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const errors = validateForgotPasswordForm({ email });
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      await forgotPassword({ email: normalizedEmail });
      router.replace({ pathname: FORGOT_PASSWORD_CODE_ROUTE, params: { email: normalizedEmail } });
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Forgot password" }} />
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
            Enter the email linked to your account and we&apos;ll send you a 6-digit reset code.
          </Text>

          <View className="mt-8 gap-4">
            <FormField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              error={fieldErrors.email}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              onSubmitEditing={handleSubmit}
              placeholder="you@example.com"
              returnKeyType="send"
              value={email}
            />
          </View>

          {requestError ? <FormAlert className="mt-4" message={requestError} /> : null}

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            disabled={isSubmitting}
            onPress={handleSubmit}
            size="lg"
          >
            {isSubmitting ? <ActivityIndicator color={primaryForeground} /> : "Send code"}
          </Button>

          <View className="mt-4 flex-row items-center justify-center">
            <Button
              className="h-11"
              onPress={() => router.replace(LOGIN_ROUTE)}
              size="sm"
              variant="link"
            >
              Back to login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
