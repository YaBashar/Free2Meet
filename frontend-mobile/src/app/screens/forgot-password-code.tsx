/**
 * Forgot password code screen
 *
 * Collects the 6-digit reset code emailed after the member starts a password
 * reset. Calls `POST /auth/verify-reset-code` before allowing them to choose
 * a new password.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { resendResetCode, verifyResetCode } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { validateVerificationCode } from "@/lib/auth/validation";

/** Verifies the reset code before the member can set a new password. */
export default function ForgotPasswordCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates locally, then confirms the reset code with the API. */
  async function handleVerify() {
    const error = validateVerificationCode(code);
    setFieldError(error);
    setRequestError(null);

    if (error) {
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyResetCode({ resetCode: code });
      router.replace({ pathname: "/screens/reset-password", params: { resetCode: code } });
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  /** Requests a fresh reset code for the current email address. */
  async function handleResend() {
    try {
      await resendResetCode({ email });
      Alert.alert("Code sent", "A new code is on its way. Check your inbox.");
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  return (
    <FormScreen
      subtitle={`Enter the 6-digit code we sent to ${email} before choosing a new password.`}
      title="Enter reset code"
    >
      <FormField
        error={fieldError}
        keyboardType="number-pad"
        label="Reset code"
        maxLength={6}
        onChangeText={setCode}
        placeholder="123456"
        value={code}
      />

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleVerify}>
        {isSubmitting ? "Checking…" : "Continue"}
      </Button>
      <Button onPress={handleResend} variant="link">
        Resend code
      </Button>
      <Button onPress={() => router.replace("/screens/forgot-password")} variant="link">
        Use a different email
      </Button>
    </FormScreen>
  );
}
