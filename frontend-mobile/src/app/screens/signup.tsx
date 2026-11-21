/**
 * Sign up screen
 *
 * Collects a new member's name, email, and password, validates them locally,
 * then calls `POST /auth/register`. Login is refused until the emailed
 * verification code is entered, so success moves on to verify-email rather
 * than signing the member in.
 */

import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { register } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import {
  hasFieldErrors,
  validateSignUpForm,
  type SignUpFieldErrors,
} from "@/lib/auth/validation";
import { COLORS, FONTS } from "@/lib/theme";

/** Registration form that hands off to email verification. */
export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates the form, then creates the account. */
  async function handleSubmit() {
    const errors = validateSignUpForm({ firstName, lastName, email, password });
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        password,
      });
      router.replace({ pathname: "/screens/verify-email", params: { email: normalizedEmail } });
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <FormScreen
      subtitle="Join Free2Meet to find a time that works for everyone."
      title="Create your account"
    >
      <View style={styles.row}>
        <View style={styles.column}>
          <FormField
            error={fieldErrors.firstName}
            label="First name"
            onChangeText={setFirstName}
            placeholder="Ada"
            value={firstName}
          />
        </View>
        <View style={styles.column}>
          <FormField
            error={fieldErrors.lastName}
            label="Last name"
            onChangeText={setLastName}
            placeholder="Lovelace"
            value={lastName}
          />
        </View>
      </View>
      <FormAlert message={fieldErrors.fullName ?? null} />

      <FormField
        autoCapitalize="none"
        error={fieldErrors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="you@example.com"
        value={email}
      />
      <FormField
        autoCapitalize="none"
        error={fieldErrors.password}
        label="Password"
        onChangeText={setPassword}
        placeholder="Create a password"
        secureTextEntry
        value={password}
      />
      <Text style={styles.hint}>
        At least 8 characters, with upper and lower case letters and one special character.
      </Text>

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleSubmit}>
        {isSubmitting ? "Signing up…" : "Sign Up"}
      </Button>
      <Button onPress={() => router.replace("/screens/login")} variant="link">
        Already registered? Log in
      </Button>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
  },
  hint: {
    color: COLORS.mutedForeground,
    fontFamily: FONTS.regular,
  },
});
