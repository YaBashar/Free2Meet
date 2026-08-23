/**
 * Login screen
 *
 * Collects a member's email and password, validates them locally, then calls
 * `POST /auth/login` and stores the returned session. Ported from the web
 * app's Login component. Password reset is not offered here yet.
 */

import { router, Stack } from "expo-router";
import { useRef, useState } from "react";
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
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { hasFieldErrors, validateLoginForm, type LoginFieldErrors } from "@/lib/auth/validation";

/** Email and password form for returning members. */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const { primaryForeground } = useThemeColors();
  const passwordInput = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates the form, then signs the member in and opens the dashboard. */
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const errors = validateLoginForm({ email, password });
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({ email: email.trim().toLowerCase(), password });
      signIn(session);
      // Stays submitting so the button cannot fire again during the
      // navigation transition that unmounts this screen.
      router.replace("/screens/dashboard");
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Welcome back" }} />
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
            Log in to pick times that work for you and your friends.
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
              onSubmitEditing={() => passwordInput.current?.focus()}
              placeholder="you@example.com"
              returnKeyType="next"
              value={email}
            />

            <FormField
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect={false}
              error={fieldErrors.password}
              label="Password"
              onChangeText={setPassword}
              onSubmitEditing={handleSubmit}
              placeholder="Enter your password"
              ref={passwordInput}
              returnKeyType="go"
              secureTextEntry
              value={password}
            />
          </View>

          {requestError ? <FormAlert className="mt-4" message={requestError} /> : null}

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            disabled={isSubmitting}
            onPress={handleSubmit}
            size="lg"
          >
            {isSubmitting ? <ActivityIndicator color={primaryForeground} /> : "Log In"}
          </Button>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="font-outfit text-sm text-muted-foreground">New to Free2Meet?</Text>
            <Button
              className="h-11"
              onPress={() => router.replace("/screens/signup")}
              size="sm"
              variant="link"
            >
              Sign up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
