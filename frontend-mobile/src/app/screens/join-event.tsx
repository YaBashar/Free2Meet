/**
 * Join event screen
 *
 * Collects a 6-digit invite code and joins via `POST /attendees/join`.
 * Entering a join code is the acceptance.
 */

import { router } from "expo-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { joinEvent } from "@/lib/api/attendees";
import { getErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { validateInviteCode } from "@/lib/events/validation";

/** Joins an event with a 6-digit invite code. */
export default function JoinEventScreen() {
  const { session } = useAuth();

  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  /** Validates locally, joins the event, then returns to the dashboard. */
  async function handleJoin() {
    const error = validateInviteCode(code);
    setFieldError(error);
    setRequestError(null);

    if (error || !session) {
      return;
    }

    setIsJoining(true);

    try {
      await joinEvent(session.accessToken, { inviteCode: code });
      router.back();
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsJoining(false);
    }
  }

  return (
    <FormScreen
      subtitle="Enter the 6-digit invite code you received to join the event."
      title="Join event"
    >
      <FormField
        error={fieldError}
        keyboardType="number-pad"
        label="Invite code"
        maxLength={6}
        onChangeText={setCode}
        placeholder="123456"
        value={code}
      />

      <FormAlert message={requestError} />

      <Button disabled={isJoining} onPress={handleJoin}>
        {isJoining ? "Joining…" : "Join event"}
      </Button>
    </FormScreen>
  );
}
