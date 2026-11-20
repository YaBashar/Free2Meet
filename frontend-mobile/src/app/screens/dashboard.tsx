/**
 * Dashboard screen
 *
 * Signed-in home with Hosting / Attending tabs. Hosting loads organised
 * events from `GET /events/organised-events` and offers Create Event, which
 * opens the mobile create-event screen (web `EventInputDialog` counterpart).
 * Join Event opens the invite-code screen to accept an event share code.
 * Hosting cards resolve a reusable invite via `POST /events/:eventId/invite`
 * (same code until expiry or regenerate). After the first fetch, the share
 * control toggles the invite strip open/closed without another request.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, Stack, useFocusEffect, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  createEventInvite,
  regenerateEventInvite,
  getAttendingEvents,
  getOrganisedEvents,
  type EventSummary,
} from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { formatApiDateForDisplay, formatMinutesAs12Hour } from "@/lib/events/validation";
import { cn } from "@/lib/utils";

const CREATE_EVENT_ROUTE = "/screens/create-event" as Href;
const JOIN_EVENT_ROUTE = "/screens/join-event" as Href;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type DashboardTab = "hosting" | "attending";
type LoadMode = "initial" | "refresh";

function formatEventSchedule(event: EventSummary): string {
  const timeRange = `${formatMinutesAs12Hour(event.startTime)}–${formatMinutesAs12Hour(event.endTime)}`;

  if (event.startDate === event.endDate) {
    return `${formatApiDateForDisplay(event.startDate)} \n${timeRange}`;
  }

  return `${formatApiDateForDisplay(event.startDate)} → ${formatApiDateForDisplay(event.endDate)} · ${timeRange}`;
}

/** Signed-in event list with create flow. */
export default function DashboardScreen() {
  const { session, signOut } = useAuth();
  const { primary, primaryForeground } = useThemeColors();

  const [tab, setTab] = useState<DashboardTab>("hosting");
  const [hostingEvents, setHostingEvents] = useState<EventSummary[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);

  const loadEvents = useCallback(
    async (mode: LoadMode = "initial", tabs: DashboardTab[] = ["hosting", "attending"]) => {
      if (!session) {
        setHostingEvents([]);
        setAttendingEvents([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestId = ++loadRequestIdRef.current;

      if (mode === "initial") {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setRequestError(null);

      const results = await Promise.allSettled(
        tabs.map(async (dashboardTab) => {
          const response =
            dashboardTab === "hosting"
              ? await getOrganisedEvents(session.accessToken)
              : await getAttendingEvents(session.accessToken);

          return { dashboardTab, events: response.events };
        }),
      );

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      const errors: string[] = [];

      for (const result of results) {
        if (result.status === "fulfilled") {
          if (result.value.dashboardTab === "hosting") {
            setHostingEvents(result.value.events);
          } else {
            setAttendingEvents(result.value.events);
          }
          continue;
        }

        const error = result.reason;
        errors.push(
          error instanceof ApiError ? error.message : "Could not load your events.",
        );
      }

      if (errors.length > 0) {
        setRequestError(errors[0]);
      }

      if (mode === "initial") {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    },
    [session],
  );

  useFocusEffect(
    useCallback(() => {
      void loadEvents("initial");
    }, [loadEvents]),
  );

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  const visibleEvents = tab === "hosting" ? hostingEvents : attendingEvents;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: `Welcome${session ? `, ${session.user.name}` : ""}`,
          headerBackVisible: false,
        }}
      />

      <View className="flex-1 px-6 pt-2">
        <View className="flex-row gap-2 rounded-2xl bg-muted p-1">
          <TabButton
            label="Hosting"
            onPress={() => setTab("hosting")}
            selected={tab === "hosting"}
          />
          <TabButton
            label="Attending"
            onPress={() => setTab("attending")}
            selected={tab === "attending"}
          />
        </View>

        <View className="mt-4 mb-1 flex-row gap-3">
          <View className="flex-1">
            <View
              pointerEvents="none"
              style={{
                backgroundColor: "rgba(30, 41, 107, 0.45)",
                borderRadius: 16,
                bottom: -5,
                left: 3,
                position: "absolute",
                right: 3,
                top: 5,
              }}
            />
            <Button
              className="h-14 w-full gap-1.5 rounded-2xl px-3"
              onPress={() => router.push(CREATE_EVENT_ROUTE)}
              size="lg"
            >
              <Ionicons color={primaryForeground} name="add" size={22} />
              <Text
                className="shrink font-outfit-medium text-base text-primary-foreground"
                numberOfLines={1}
              >
                Create
              </Text>
            </Button>
          </View>

          <Button
            className="h-14 flex-1 gap-1.5 rounded-2xl border-2 border-primary bg-transparent px-3"
            onPress={() => router.push(JOIN_EVENT_ROUTE)}
            size="lg"
            textClassName="text-primary"
            variant="outline"
          >
            <Ionicons color={primary} name="enter-outline" size={20} />
            <Text className="shrink font-outfit-medium text-base text-primary" numberOfLines={1}>
              Join
            </Text>
          </Button>
        </View>

        <View className="mt-6 flex-row items-baseline justify-between">
          <Text className="font-outfit-semibold text-lg text-foreground">
            {tab === "hosting" ? "My Events" : "Attending"}
          </Text>
          <Text className="font-outfit text-sm text-muted-foreground">
            {visibleEvents.length} {visibleEvents.length === 1 ? "event" : "events"}
          </Text>
        </View>

        {requestError ? <FormAlert className="mt-3" message={requestError} /> : null}

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={primary} size="large" />
          </View>
        ) : (
          <FlatList
            className="mt-3 flex-1"
            contentContainerClassName={cn(
              "pb-6",
              visibleEvents.length === 0 && "flex-grow justify-center",
            )}
            data={visibleEvents}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text className="text-center font-outfit text-base text-muted-foreground">
                {tab === "hosting"
                  ? "No events yet. Create one to get started."
                  : "No events yet. Join one with an invite code."}
              </Text>
            }
            refreshControl={
              <RefreshControl
                colors={[primary]}
                onRefresh={() => void loadEvents("refresh", [tab])}
                refreshing={isRefreshing}
                tintColor={primary}
              />
            }
            renderItem={({ item }) => (
              <EventListCard
                accessToken={session?.accessToken}
                event={item}
                tab={tab}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          className="mb-2 h-14 w-full rounded-2xl border-2 border-primary bg-transparent"
          onPress={handleSignOut}
          size="lg"
          textClassName="text-primary"
          variant="outline"
        >
          Sign Out
        </Button>
      </View>
    </SafeAreaView>
  );
}

type TabButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function TabButton({ label, selected, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      className={cn(
        "flex-1 items-center rounded-xl py-3",
        selected ? "bg-primary" : "bg-transparent",
      )}
      onPress={onPress}
    >
      <Text
        className={cn(
          "font-outfit-medium text-sm",
          selected ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type EventListCardProps = {
  accessToken?: string;
  event: EventSummary;
  tab: DashboardTab;
};

/** One event row; hosting rows can generate, copy, and share an invite code. */
function EventListCard({ accessToken, event, tab }: EventListCardProps) {
  const { primary, primaryForeground, mutedForeground } = useThemeColors();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteExpiryLabel, setInviteExpiryLabel] = useState<string | null>(null);
  const [inviteExpired, setInviteExpired] = useState(false);
  const [isInviteExpanded, setIsInviteExpanded] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isGeneratingInviteRef = useRef(false);

  function toggleInviteExpanded() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsInviteExpanded((open) => !open);
  }

  function applyInviteResponse(response: {
    inviteCode: string;
    inviteCodeExpiry: string;
    expired: boolean;
    message?: string;
  }) {
    setInviteCode(response.inviteCode);
    setInviteExpired(response.expired);
    setInviteExpiryLabel(formatApiDateForDisplay(response.inviteCodeExpiry.slice(0, 10)));
    if (response.expired && response.message) {
      setInviteError(response.message);
    } else {
      setInviteError(null);
    }
  }

  async function copyInviteToClipboard(code: string) {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  /**
   * Resolves the event's reusable invite from the server, expands the strip,
   * and copies the code when it is still valid. Collapse never calls this.
   */
  async function ensureInviteCode() {
    if (!accessToken || isGeneratingInviteRef.current) {
      return;
    }

    isGeneratingInviteRef.current = true;
    setIsGeneratingInvite(true);
    setInviteError(null);

    try {
      const response = await createEventInvite(accessToken, event.id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      applyInviteResponse(response);
      setIsInviteExpanded(true);
      if (!response.expired) {
        void copyInviteToClipboard(response.inviteCode);
      } else {
        setCopied(false);
      }
    } catch (error) {
      setInviteError(
        error instanceof ApiError ? error.message : "Could not create an invite code.",
      );
    } finally {
      isGeneratingInviteRef.current = false;
      setIsGeneratingInvite(false);
    }
  }

  /** Mints a new code (after expiry or to revoke the previous share). */
  async function handleRegenerateInvite() {
    if (!accessToken || isGeneratingInviteRef.current) {
      return;
    }

    isGeneratingInviteRef.current = true;
    setIsGeneratingInvite(true);
    setInviteError(null);

    try {
      const response = await regenerateEventInvite(accessToken, event.id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      applyInviteResponse(response);
      setIsInviteExpanded(true);
      void copyInviteToClipboard(response.inviteCode);
    } catch (error) {
      setInviteError(
        error instanceof ApiError ? error.message : "Could not generate a new invite code.",
      );
    } finally {
      isGeneratingInviteRef.current = false;
      setIsGeneratingInvite(false);
    }
  }

  /**
   * Share control: once a code exists, toggle expand/collapse locally.
   * First press (no code yet) fetches from the server.
   */
  function handleShareButtonPress() {
    if (inviteCode) {
      toggleInviteExpanded();
      return;
    }

    void ensureInviteCode();
  }

  /** Copies the invite code and briefly shows confirmation. */
  async function handleCopyInvite() {
    if (!inviteCode || inviteExpired) {
      return;
    }

    await copyInviteToClipboard(inviteCode);
  }

  /** Opens the system share sheet with the invite code message. */
  async function handleShareInvite() {
    if (!inviteCode || inviteExpired) {
      return;
    }

    await Share.share({
      message: `Join "${event.title}" on Free2Meet with invite code: ${inviteCode}`,
    });
  }

  return (
    <View className="mb-3 rounded-2xl border border-border bg-card px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="font-outfit-semibold text-base text-foreground">{event.title}</Text>
          <Text className="font-outfit text-sm text-muted-foreground">
            {formatEventSchedule(event)}
          </Text>
          <Text className="font-outfit text-sm text-muted-foreground">{event.location}</Text>
        </View>
        <View className="items-end gap-2">
          <View className="rounded-lg bg-primary/10 px-2.5 py-1">
            <Text className="font-outfit-medium text-xs text-primary">
              {tab === "hosting" ? "Hosting" : "Attending"}
            </Text>
          </View>
          {tab === "hosting" ? (
            <Pressable
              accessibilityLabel={
                inviteCode
                  ? isInviteExpanded
                    ? "Hide invite code"
                    : "Show invite code"
                  : "Create invite code"
              }
              accessibilityRole="button"
              accessibilityState={{ expanded: inviteCode ? isInviteExpanded : undefined }}
              className="h-9 w-9 items-center justify-center rounded-lg border border-border"
              disabled={isGeneratingInvite}
              onPress={handleShareButtonPress}
            >
              {isGeneratingInvite ? (
                <ActivityIndicator color={primary} size="small" />
              ) : (
                <Ionicons
                  color={primary}
                  name={
                    inviteCode
                      ? isInviteExpanded
                        ? "chevron-up"
                        : "chevron-down"
                      : "share-outline"
                  }
                  size={18}
                />
              )}
            </Pressable>
          ) : null}
        </View>
      </View>

      {tab === "hosting" && inviteError ? (
        <FormAlert className="mt-3" message={inviteError} />
      ) : null}

      {tab === "hosting" && inviteCode && isInviteExpanded ? (
        <View className="mt-3 gap-3 border-t border-border pt-3">
          <Pressable
            accessibilityLabel="Hide invite code"
            accessibilityRole="button"
            className="flex-row items-center justify-between"
            onPress={toggleInviteExpanded}
          >
            <Text className="font-outfit text-xs text-muted-foreground">
              {inviteExpired
                ? "Invite code expired"
                : inviteExpiryLabel
                  ? `Reusable · expires ${inviteExpiryLabel}`
                  : "Reusable invite code"}
            </Text>
            <Ionicons color={mutedForeground} name="chevron-up" size={16} />
          </Pressable>
          <Text
            className={cn(
              "font-outfit-semibold text-2xl tracking-[6px]",
              inviteExpired ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {inviteCode}
          </Text>
          {inviteExpired ? (
            <Pressable
              accessibilityLabel="Generate new invite code"
              accessibilityRole="button"
              className="h-11 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary"
              disabled={isGeneratingInvite}
              onPress={() => void handleRegenerateInvite()}
            >
              {isGeneratingInvite ? (
                <ActivityIndicator color={primaryForeground} size="small" />
              ) : (
                <>
                  <Ionicons color={primaryForeground} name="refresh-outline" size={16} />
                  <Text className="font-outfit-medium text-sm text-primary-foreground">
                    Generate new code
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            <View className="gap-2">
              <View className="flex-row gap-2">
                <Pressable
                  accessibilityLabel="Copy invite code"
                  accessibilityRole="button"
                  className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border"
                  onPress={() => void handleCopyInvite()}
                >
                  <Ionicons
                    color={copied ? primary : mutedForeground}
                    name={copied ? "checkmark" : "copy-outline"}
                    size={16}
                  />
                  <Text
                    className={cn(
                      "font-outfit-medium text-sm",
                      copied ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Share invite code"
                  accessibilityRole="button"
                  className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary"
                  onPress={() => void handleShareInvite()}
                >
                  <Ionicons color={primaryForeground} name="share-social-outline" size={16} />
                  <Text className="font-outfit-medium text-sm text-primary-foreground">Share</Text>
                </Pressable>
              </View>
              <Pressable
                accessibilityLabel="Generate new invite code"
                accessibilityRole="button"
                className="h-10 flex-row items-center justify-center gap-1.5"
                disabled={isGeneratingInvite}
                onPress={() => void handleRegenerateInvite()}
              >
                <Ionicons color={mutedForeground} name="refresh-outline" size={14} />
                <Text className="font-outfit text-xs text-muted-foreground">
                  New code (invalidates current)
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
