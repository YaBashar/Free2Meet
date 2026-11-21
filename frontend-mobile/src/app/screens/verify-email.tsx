/**
 * Verify email screen
 *
 * Collects the 6-digit code emailed after registration. Calls
 * `POST /auth/verify-email` and signs the member in on success. Reached
 * after sign up or when login finds an unverified account.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { resendVerification, verifyEmail } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { validateVerificationCode } from "@/lib/auth/validation";

/** Email verification with resend support. */
export default function VerifyEmailScreen() {
  const { signIn } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates locally, then confirms the code with the API. */
  async function handleVerify() {
    const error = validateVerificationCode(code);
    setFieldError(error);
    setRequestError(null);

    if (error) {
      return;
    }

    setIsSubmitting(true);

    try {
      signIn(await verifyEmail({ verificationCode: code }));
      router.replace("/screens/dashboard");
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  /** Requests a new verification code for the current email address. */
  async function handleResend() {
    try {
      await resendVerification({ email });
      Alert.alert("Code sent", "A new code is on its way. Check your inbox.");
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  return (
    <FormScreen
      subtitle={`Enter the 6-digit code we sent to ${email}. You need to verify before you can log in.`}
      title="Verify your email"
    >
      <FormField
        error={fieldError}
        keyboardType="number-pad"
        label="Verification code"
        maxLength={6}
        onChangeText={setCode}
        placeholder="123456"
        value={code}
      />

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleVerify}>
        {isSubmitting ? "Verifying…" : "Verify Email"}
      </Button>
      <Button onPress={handleResend} variant="link">
        Resend code
      </Button>
      <Button onPress={() => router.replace("/screens/login")} variant="link">
        Back to login
      </Button>
    </FormScreen>
  );
}
