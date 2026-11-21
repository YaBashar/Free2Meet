/**
 * Forgot password screen
 *
 * Collects the account email address, validates it locally, then calls
 * `POST /auth/forgot-password`. The next step always asks for the reset code
 * so the flow does not reveal whether the email exists.
 */

import { router } from "expo-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { forgotPassword } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { validateEmail } from "@/lib/auth/validation";

/** Starts the reset-password flow from an email address. */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates the email, then triggers the password reset email. */
  async function handleSubmit() {
    const error = validateEmail(email);
    setFieldError(error);
    setRequestError(null);

    if (error) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      await forgotPassword({ email: normalizedEmail });
      router.replace({
        pathname: "/screens/forgot-password-code",
        params: { email: normalizedEmail },
      });
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <FormScreen
      subtitle="Enter the email linked to your account and we'll send you a 6-digit reset code."
      title="Forgot password"
    >
      <FormField
        autoCapitalize="none"
        error={fieldError}
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="you@example.com"
        value={email}
      />

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleSubmit}>
        {isSubmitting ? "Sending…" : "Send code"}
      </Button>
      <Button onPress={() => router.replace("/screens/login")} variant="link">
        Back to login
      </Button>
    </FormScreen>
  );
}
