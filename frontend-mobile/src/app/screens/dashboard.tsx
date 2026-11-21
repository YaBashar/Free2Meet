/**
 * Dashboard screen
 *
 * Signed-in home with Hosting / Attending tabs listing the member's events,
 * plus links to create or join an event. Hosting cards can fetch the event's
 * reusable invite code, share it, or replace it with a new one.
 */

import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { getErrorMessage } from "@/lib/api/client";
import {
  createEventInvite,
  getAttendingEvents,
  getOrganisedEvents,
  regenerateEventInvite,
  type CreateEventInviteResponse,
  type EventSummary,
} from "@/lib/api/events";
import { useAuth } from "@/lib/auth/auth-context";
import { formatApiDateForDisplay, formatMinutesAs12Hour } from "@/lib/events/validation";
import { COLORS, FONTS } from "@/lib/theme";

type DashboardTab = "hosting" | "attending";

/** Formats an event's date range and time range on one line. */
function formatEventSchedule(event: EventSummary): string {
  const dates =
    event.startDate === event.endDate
      ? formatApiDateForDisplay(event.startDate)
      : `${formatApiDateForDisplay(event.startDate)} – ${formatApiDateForDisplay(event.endDate)}`;

  return `${dates} · ${formatMinutesAs12Hour(event.startTime)}–${formatMinutesAs12Hour(event.endTime)}`;
}

/** Signed-in event list with create and join actions. */
export default function DashboardScreen() {
  const { session, signOut } = useAuth();

  const [tab, setTab] = useState<DashboardTab>("hosting");
  const [hostingEvents, setHostingEvents] = useState<EventSummary[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsLoading(true);
    setRequestError(null);

    try {
      const [hosting, attending] = await Promise.all([
        getOrganisedEvents(session.accessToken),
        getAttendingEvents(session.accessToken),
      ]);
      setHostingEvents(hosting.events);
      setAttendingEvents(attending.events);
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Reload whenever the dashboard regains focus, e.g. after creating or joining an event.
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents]),
  );

  if (!session) {
    return null;
  }

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <Stack.Screen options={{ title: `Welcome, ${session.user.name}`, headerBackVisible: false }} />

      <View style={styles.row}>
        <Button
          accessibilityState={{ selected: tab === "hosting" }}
          onPress={() => setTab("hosting")}
          style={styles.flex}
          variant={tab === "hosting" ? "primary" : "outline"}
        >
          Hosting
        </Button>
        <Button
          accessibilityState={{ selected: tab === "attending" }}
          onPress={() => setTab("attending")}
          style={styles.flex}
          variant={tab === "attending" ? "primary" : "outline"}
        >
          Attending
        </Button>
      </View>

      <View style={styles.row}>
        <Button onPress={() => router.push("/screens/create-event")} style={styles.flex}>
          Create Event
        </Button>
        <Button
          onPress={() => router.push("/screens/join-event")}
          style={styles.flex}
          variant="outline"
        >
          Join Event
        </Button>
      </View>

      <FormAlert message={requestError} />

      <FlatList
        contentContainerStyle={styles.list}
        data={tab === "hosting" ? hostingEvents : attendingEvents}
        keyExtractor={(event) => event.id}
        ListEmptyComponent={
          isLoading ? null : <Text style={styles.muted}>No events yet.</Text>
        }
        onRefresh={loadEvents}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <EventCard accessToken={session.accessToken} event={item} isHost={tab === "hosting"} />
        )}
      />

      <Button onPress={handleSignOut} variant="outline">
        Sign Out
      </Button>
    </SafeAreaView>
  );
}

type EventCardProps = {
  accessToken: string;
  event: EventSummary;
  isHost: boolean;
};

/** One event; hosts can fetch, share, and regenerate its invite code. */
function EventCard({ accessToken, event, isHost }: EventCardProps) {
  const [invite, setInvite] = useState<CreateEventInviteResponse | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);

  /** Fetches the event's current invite code, or mints a new one when `regenerate` is set. */
  async function loadInvite(regenerate: boolean) {
    setIsLoadingInvite(true);
    setInviteError(null);

    try {
      const request = regenerate ? regenerateEventInvite : createEventInvite;
      setInvite(await request(accessToken, event.id));
    } catch (error) {
      setInviteError(getErrorMessage(error));
    } finally {
      setIsLoadingInvite(false);
    }
  }

  function handleShare(inviteCode: string) {
    Share.share({ message: `Join "${event.title}" on Free2Meet with invite code: ${inviteCode}` });
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.muted}>{formatEventSchedule(event)}</Text>
      <Text style={styles.muted}>{event.location}</Text>

      {isHost && !invite ? (
        <Button disabled={isLoadingInvite} onPress={() => loadInvite(false)} variant="link">
          Get invite code
        </Button>
      ) : null}

      {invite ? (
        <>
          <Text style={styles.inviteCode}>{invite.inviteCode}</Text>
          <Text style={styles.muted}>
            {invite.expired
              ? "Invite code expired"
              : `Expires ${formatApiDateForDisplay(invite.inviteCodeExpiry.slice(0, 10))}`}
          </Text>
          {invite.expired ? null : (
            <Button onPress={() => handleShare(invite.inviteCode)}>Share</Button>
          )}
          <Button disabled={isLoadingInvite} onPress={() => loadInvite(true)} variant="link">
            Generate new code
          </Button>
        </>
      ) : null}

      <FormAlert message={inviteError} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 24,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  muted: {
    color: COLORS.mutedForeground,
    fontFamily: FONTS.regular,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    gap: 4,
    padding: 16,
  },
  cardTitle: {
    color: COLORS.foreground,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  inviteCode: {
    color: COLORS.foreground,
    fontFamily: FONTS.bold,
    fontSize: 24,
    letterSpacing: 4,
  },
});
