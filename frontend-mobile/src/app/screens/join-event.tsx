/**
 * Join event screen
 *
 * Collects a 6-digit invite code and joins via `POST /attendees/join`.
 * Entering a join code is the acceptance. Reached from the dashboard
 * Join Event button.
 */

import { router, Stack } from "expo-router";
import { useState } from "react";
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
import { joinEvent } from "@/lib/api/attendees";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { validateInviteCode } from "@/lib/events/validation";

/** Joins an event with a 6-digit invite code. */
export default function JoinEventScreen() {
  const { session } = useAuth();
  const { primaryForeground } = useThemeColors();

  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  /** Validates locally, joins the event, then returns to the dashboard. */
  async function handleJoin(submittedCode = code) {
    if (isJoining) {
      return;
    }

    const error = validateInviteCode(submittedCode);
    setFieldError(error);
    setRequestError(null);

    if (error) {
      return;
    }

    if (!session) {
      setRequestError("You need to be signed in to join an event.");
      return;
    }

    setIsJoining(true);

    try {
      await joinEvent(session.accessToken, { inviteCode: submittedCode });
      router.back();
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
      setIsJoining(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "Join event" }} />
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
            Enter the 6-digit invite code you received to join the event.
          </Text>

          <View className="mt-8 gap-2">
            <VerificationCodeInput
              hasError={Boolean(fieldError || requestError)}
              onChange={(value) => {
                setCode(value);
                if (fieldError) {
                  setFieldError(undefined);
                }
                if (requestError) {
                  setRequestError(null);
                }
              }}
              onComplete={handleJoin}
              value={code}
            />

            {fieldError ? (
              <Text className="font-outfit text-xs text-destructive">{fieldError}</Text>
            ) : null}
          </View>

          {requestError ? <FormAlert className="mt-4" message={requestError} /> : null}

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            disabled={isJoining}
            onPress={() => handleJoin()}
            size="lg"
          >
            {isJoining ? <ActivityIndicator color={primaryForeground} /> : "Join event"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
