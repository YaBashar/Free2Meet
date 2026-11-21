/**
 * Reset password screen
 *
 * Lets a member choose and confirm a new password after their reset code has
 * been verified. Calls `POST /auth/reset-password` and signs the member in on
 * success.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { resetPassword } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import {
  hasFieldErrors,
  validateResetPasswordForm,
  type ResetPasswordFieldErrors,
} from "@/lib/auth/validation";
import { COLORS, FONTS } from "@/lib/theme";

/** Completes the password reset after the code has been verified. */
export default function ResetPasswordScreen() {
  const { signIn } = useAuth();
  const { resetCode } = useLocalSearchParams<{ resetCode: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates the form, then exchanges the code for a new password and session. */
  async function handleSubmit() {
    const errors = validateResetPasswordForm({ password, confirmPassword });
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      signIn(await resetPassword({ resetCode, newPassword: password }));
      router.replace("/screens/dashboard");
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <FormScreen
      subtitle="Enter a new password for your account. You'll be signed in once it's updated."
      title="Create new password"
    >
      <FormField
        autoCapitalize="none"
        error={fieldErrors.password}
        label="New password"
        onChangeText={setPassword}
        placeholder="Create a new password"
        secureTextEntry
        value={password}
      />
      <FormField
        autoCapitalize="none"
        error={fieldErrors.confirmPassword}
        label="Confirm new password"
        onChangeText={setConfirmPassword}
        placeholder="Re-enter your new password"
        secureTextEntry
        value={confirmPassword}
      />
      <Text style={styles.hint}>
        At least 8 characters, with upper and lower case letters and one special character.
      </Text>

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleSubmit}>
        {isSubmitting ? "Saving…" : "Reset password"}
      </Button>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: COLORS.mutedForeground,
    fontFamily: FONTS.regular,
  },
});
