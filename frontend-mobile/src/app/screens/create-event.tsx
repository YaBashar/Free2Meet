/**
 * Create event screen
 *
 * Mobile counterpart to the web `EventInputDialog`. Collects title,
 * description, location, date, and start/end times, then posts
 * `POST /events/new-event` as a single-day event and returns to the dashboard.
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
import { DateField } from "@/components/ui/date-field";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { TimeField } from "@/components/ui/time-field";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { createEvent, EventType } from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import {
  formatEventDateForApi,
  hasFieldErrors,
  parseEventTimes,
  validateCreateEventForm,
  type CreateEventFieldErrors,
} from "@/lib/events/validation";

/** Start of today in local time — events cannot be scheduled in the past. */
function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Form for organising a new single-day event. */
export default function CreateEventScreen() {
  const { session } = useAuth();
  const { primaryForeground } = useThemeColors();
  const [minimumDate] = useState(startOfToday);

  const descriptionInput = useRef<TextInput>(null);
  const locationInput = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CreateEventFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validates locally, creates the event, then pops back to the dashboard. */
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (!session) {
      setRequestError("You need to be signed in to create an event.");
      return;
    }

    const errors = validateCreateEventForm({
      title,
      description,
      location,
      date,
      startTime,
      endTime,
    });
    setFieldErrors(errors);
    setRequestError(null);

    if (hasFieldErrors(errors) || !date || !startTime || !endTime) {
      return;
    }

    setIsSubmitting(true);

    try {
      const times = parseEventTimes(startTime, endTime);
      const apiDate = formatEventDateForApi(date);

      await createEvent(session.accessToken, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        eventType: EventType.SINGLE,
        startDate: apiDate,
        endDate: apiDate,
        startTime: times.startTime,
        endTime: times.endTime,
      });

      router.back();
    } catch (error) {
      setRequestError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "New Event" }} />
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
            Set the details so friends can find a time that works.
          </Text>

          <View className="mt-8 gap-4">
            <FormField
              autoCapitalize="sentences"
              autoCorrect
              error={fieldErrors.title}
              label="Event Title"
              onChangeText={setTitle}
              onSubmitEditing={() => descriptionInput.current?.focus()}
              placeholder="Weekend Brunch"
              returnKeyType="next"
              value={title}
            />

            <FormField
              autoCapitalize="sentences"
              autoCorrect
              error={fieldErrors.description}
              label="Description"
              onChangeText={setDescription}
              onSubmitEditing={() => locationInput.current?.focus()}
              placeholder="Casual catch-up over coffee"
              ref={descriptionInput}
              returnKeyType="next"
              value={description}
            />

            <FormField
              autoCapitalize="words"
              autoCorrect
              error={fieldErrors.location}
              label="Location"
              onChangeText={setLocation}
              placeholder="Bondi Beach Cafe"
              ref={locationInput}
              returnKeyType="done"
              value={location}
            />

            <DateField
              error={fieldErrors.date}
              label="Date"
              minimumDate={minimumDate}
              onChange={(selected) => {
                setDate(selected);
                setFieldErrors((current) => ({ ...current, date: undefined }));
              }}
              placeholder="Select a date"
              value={date}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TimeField
                  error={fieldErrors.startTime}
                  label="Start Time"
                  onChange={(selected) => {
                    setStartTime(selected);
                    setFieldErrors((current) => ({ ...current, startTime: undefined }));
                  }}
                  placeholder="Start"
                  value={startTime}
                />
              </View>

              <View className="flex-1">
                <TimeField
                  error={fieldErrors.endTime}
                  label="End Time"
                  onChange={(selected) => {
                    setEndTime(selected);
                    setFieldErrors((current) => ({ ...current, endTime: undefined }));
                  }}
                  placeholder="End"
                  value={endTime}
                />
              </View>
            </View>
          </View>

          {requestError ? <FormAlert className="mt-4" message={requestError} /> : null}

          <Button
            className="mt-8 h-14 w-full rounded-2xl"
            disabled={isSubmitting}
            onPress={handleSubmit}
            size="lg"
          >
            {isSubmitting ? <ActivityIndicator color={primaryForeground} /> : "Create Event"}
          </Button>

          <Button
            className="mt-3 h-14 w-full rounded-2xl border-2 border-border bg-transparent"
            disabled={isSubmitting}
            onPress={() => router.back()}
            size="lg"
            textClassName="text-foreground"
            variant="outline"
          >
            Cancel
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
