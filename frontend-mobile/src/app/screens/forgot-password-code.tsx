/**
 * Forgot password code screen
 *
 * Collects the 6-digit reset code emailed after the member starts a password
 * reset. Calls `POST /auth/verify-reset-code` before allowing them to choose
 * a new password.
 */

import { router, Stack, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { VerificationCodeInput } from "@/components/ui/verification-code-input";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { resendResetCode, verifyResetCode } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { validateVerificationCode } from "@/lib/auth/validation";

const FORGOT_PASSWORD_ROUTE = "/screens/forgot-password" as Href;
const RESET_PASSWORD_ROUTE = "/screens/reset-password" as Href;

/** Verifies the reset code before the member can set a new password. */
export default function ForgotPasswordCodeScreen() {
  const { primaryForeground } = useThemeColors();
  const { email: rawEmail } = useLocalSearchParams<{ email?: string | string[] }>();

  const email = normalizeEmailParam(rawEmail);
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.replace(FORGOT_PASSWORD_ROUTE);
    }
  }, [email]);

  /** Validates locally, then confirms the reset code with the API. */
  async function handleVerify(submittedCode = code) {
    if (isSubmitting) {
      return;
    }

    const error = validateVerificationCode(submittedCode);
    setFieldError(error);
    setRequestError(null);
    setResendMessage(null);

    if (error) {
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyResetCode({ resetCode: submittedCode });
      router.replace({
        pathname: RESET_PASSWORD_ROUTE,
        params: { resetCode: submittedCode },
      });
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  /** Requests a fresh reset code for the current email address. */
  async function handleResend() {
    if (!email || isResending) {
      return;
    }

    setIsResending(true);
    setRequestError(null);
    setResendMessage(null);

    try {
      await resendResetCode({ email });
      setResendMessage("A new code is on its way. Check your inbox.");
      setCode("");
      setFieldError(undefined);
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Enter reset code" }} />
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
            Enter the 6-digit code we sent to {email} before choosing a new password.
          </Text>

          <View className="mt-8 gap-2">
            <VerificationCodeInput
              hasError={Boolean(fieldError || requestError)}
              onChange={(value) => {
                setCode(value);
                if (fieldError) {
                  setFieldError(undefined);
                }
              }}
              onComplete={handleVerify}
              value={code}
            />

            {fieldError ? (
              <Text className="font-outfit text-xs text-destructive">{fieldError}</Text>
            ) : null}
          </View>

          {requestError ? <FormAlert className="mt-4" message={requestError} /> : null}
          {resendMessage ? (
            <Text className="mt-4 font-outfit text-sm text-muted-foreground">{resendMessage}</Text>
          ) : null}

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            disabled={isSubmitting}
            onPress={() => handleVerify()}
            size="lg"
          >
            {isSubmitting ? <ActivityIndicator color={primaryForeground} /> : "Continue"}
          </Button>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="font-outfit text-sm text-muted-foreground">Didn't get a code?</Text>
            <Button
              className="h-11"
              disabled={isResending}
              onPress={handleResend}
              size="sm"
              variant="link"
            >
              {isResending ? "Sending…" : "Resend code"}
            </Button>
          </View>

          <View className="mt-2 flex-row items-center justify-center">
            <Button
              className="h-11"
              onPress={() => router.replace(FORGOT_PASSWORD_ROUTE)}
              size="sm"
              variant="link"
            >
              Use a different email
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function normalizeEmailParam(value: string | string[] | undefined): string | null {
  const email = Array.isArray(value) ? value[0] : value;
  const trimmed = email?.trim().toLowerCase();

  return trimmed ? trimmed : null;
}
