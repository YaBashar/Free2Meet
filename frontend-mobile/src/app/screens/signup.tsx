/**
 * Sign up screen
 *
 * Collects a new member's name, email, and password, validates them locally,
 * then calls `POST /auth/register`. Ported from the web app's Register
 * component. Registration only creates the account: the API emails a
 * verification code, and login is refused until that email is verified, so
 * this screen confirms the next step rather than signing the member in.
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
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  hasFieldErrors,
  validateSignUpForm,
  type SignUpFieldErrors,
  type SignUpFormValues,
} from "@/lib/auth/validation";

const EMPTY_FORM: SignUpFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

/** Registration form, replaced by a confirmation once the account exists. */
export default function SignUpScreen() {
  const { primaryForeground } = useThemeColors();
  const lastNameInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);

  const [values, setValues] = useState<SignUpFormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  /** Updates one field without disturbing the others. */
  function handleFieldChange(field: keyof SignUpFormValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  /** Validates the form, then creates the account. */
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const errors = validateSignUpForm(values);
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors)) {
      return;
    }

    const email = values.email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email,
        password: values.password,
      });
      setRegisteredEmail(email);
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
        <Stack.Screen options={{ title: "Check your email", headerBackVisible: false }} />
        <View className="flex-1 justify-center px-6">
          <Text className="font-outfit text-base text-muted-foreground">
            We sent a verification link to {registeredEmail}. Verify your email, then log in to
            start planning.
          </Text>

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            onPress={() => router.replace("/screens/login")}
            size="lg"
          >
            Go to Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Create your account" }} />
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
            Join Free2Meet to find a time that works for everyone.
          </Text>

          <View className="mt-8 gap-4">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField
                  autoComplete="given-name"
                  error={fieldErrors.firstName}
                  label="First name"
                  onChangeText={(value) => handleFieldChange("firstName", value)}
                  onSubmitEditing={() => lastNameInput.current?.focus()}
                  placeholder="Ada"
                  returnKeyType="next"
                  value={values.firstName}
                />
              </View>

              <View className="flex-1">
                <FormField
                  autoComplete="family-name"
                  error={fieldErrors.lastName}
                  label="Last name"
                  onChangeText={(value) => handleFieldChange("lastName", value)}
                  onSubmitEditing={() => emailInput.current?.focus()}
                  placeholder="Lovelace"
                  ref={lastNameInput}
                  returnKeyType="next"
                  value={values.lastName}
                />
              </View>
            </View>

            {fieldErrors.fullName ? (
              <Text className="font-outfit text-xs text-destructive">{fieldErrors.fullName}</Text>
            ) : null}

            <FormField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              error={fieldErrors.email}
              keyboardType="email-address"
              label="Email"
              onChangeText={(value) => handleFieldChange("email", value)}
              onSubmitEditing={() => passwordInput.current?.focus()}
              placeholder="you@example.com"
              ref={emailInput}
              returnKeyType="next"
              value={values.email}
            />

            <FormField
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              error={fieldErrors.password}
              label="Password"
              onChangeText={(value) => handleFieldChange("password", value)}
              onSubmitEditing={handleSubmit}
              placeholder="Create a password"
              ref={passwordInput}
              returnKeyType="go"
              secureTextEntry
              value={values.password}
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
            {isSubmitting ? <ActivityIndicator color={primaryForeground} /> : "Sign Up"}
          </Button>

          <View className="mt-4 flex-row items-center justify-center">
            <Text className="font-outfit text-sm text-muted-foreground">Already registered?</Text>
            <Button
              className="h-11"
              onPress={() => router.replace("/screens/login")}
              size="sm"
              variant="link"
            >
              Sign in
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
