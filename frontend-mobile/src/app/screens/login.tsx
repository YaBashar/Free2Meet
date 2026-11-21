/**
 * Login screen
 *
 * Collects a member's email and password, validates them locally, then calls
 * `POST /auth/login` and stores the returned session. Members can also start
 * the password reset flow from here.
 */

import { router } from "expo-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { login, UNVERIFIED_EMAIL_ERROR } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { hasFieldErrors, validateLoginForm, type LoginFieldErrors } from "@/lib/auth/validation";

/** Email and password form for returning members. */
export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates the form, then signs the member in and opens the dashboard. */
  async function handleSubmit() {
    const errors = validateLoginForm({ email, password });
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      signIn(await login({ email: normalizedEmail, password }));
      router.replace("/screens/dashboard");
    } catch (error) {
      if (getErrorMessage(error) === UNVERIFIED_EMAIL_ERROR) {
        router.replace({ pathname: "/screens/verify-email", params: { email: normalizedEmail } });
        return;
      }

      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <FormScreen
      subtitle="Log in to pick times that work for you and your friends."
      title="Welcome back"
    >
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
        placeholder="Enter your password"
        secureTextEntry
        value={password}
      />

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleSubmit}>
        {isSubmitting ? "Logging in…" : "Log In"}
      </Button>
      <Button onPress={() => router.push("/screens/forgot-password")} variant="link">
        Forgot password?
      </Button>
      <Button onPress={() => router.replace("/screens/signup")} variant="link">
        New to Free2Meet? Sign up
      </Button>
    </FormScreen>
  );
}
