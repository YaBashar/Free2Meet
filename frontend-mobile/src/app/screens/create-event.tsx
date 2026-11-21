/**
 * Create event screen
 *
 * Collects title, description, location, date, and start/end times, then
 * posts `POST /events/new-event` as a single-day event and returns to the
 * dashboard.
 */

import { router } from "expo-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DateTimeField } from "@/components/ui/date-time-field";
import { FormAlert } from "@/components/ui/form-alert";
import { FormField } from "@/components/ui/form-field";
import { FormScreen } from "@/components/ui/form-screen";
import { getErrorMessage } from "@/lib/api/client";
import { createEvent, EventType } from "@/lib/api/events";
import { useAuth } from "@/lib/auth/auth-context";
import {
  dateToMinutesSinceMidnight,
  formatEventDateForApi,
  hasFieldErrors,
  validateCreateEventForm,
  type CreateEventFieldErrors,
} from "@/lib/events/validation";

/** Form for organising a new single-day event. */
export default function CreateEventScreen() {
  const { session } = useAuth();

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

    if (hasFieldErrors(errors) || !session || !date || !startTime || !endTime) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createEvent(session.accessToken, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        eventType: EventType.SINGLE,
        startDate: formatEventDateForApi(date),
        endDate: formatEventDateForApi(date),
        startTime: dateToMinutesSinceMidnight(startTime),
        endTime: dateToMinutesSinceMidnight(endTime),
      });
      router.back();
    } catch (error) {
      setRequestError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  }

  return (
    <FormScreen
      subtitle="Set the details so friends can find a time that works."
      title="New Event"
    >
      <FormField
        error={fieldErrors.title}
        label="Event Title"
        onChangeText={setTitle}
        placeholder="Weekend Brunch"
        value={title}
      />
      <FormField
        error={fieldErrors.description}
        label="Description"
        onChangeText={setDescription}
        placeholder="Casual catch-up over coffee"
        value={description}
      />
      <FormField
        error={fieldErrors.location}
        label="Location"
        onChangeText={setLocation}
        placeholder="Bondi Beach Cafe"
        value={location}
      />
      <DateTimeField
        error={fieldErrors.date}
        label="Date"
        minimumDate={new Date()}
        mode="date"
        onChange={setDate}
        value={date}
      />
      <DateTimeField
        error={fieldErrors.startTime}
        label="Start Time"
        mode="time"
        onChange={setStartTime}
        value={startTime}
      />
      <DateTimeField
        error={fieldErrors.endTime}
        label="End Time"
        mode="time"
        onChange={setEndTime}
        value={endTime}
      />

      <FormAlert message={requestError} />

      <Button disabled={isSubmitting} onPress={handleSubmit}>
        {isSubmitting ? "Creating…" : "Create Event"}
      </Button>
      <Button onPress={() => router.back()} variant="outline">
        Cancel
      </Button>
    </FormScreen>
  );
}
