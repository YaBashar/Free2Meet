import { getData, setData } from './dataStore';
import { Events } from './interfaces';

// TODO Future
// Use Date Object Instead of String
// Handling Multiple Dates and Timings ie 1 week range.

function createEvent(userId: string, title: string, description: string, location: string, date: string, startTime: number, endTime: number): string {
  const store = getData();
  const userIndex = store.users.findIndex(user => (user.userId === userId));
  const user = store.users[userIndex];

  if (!user) {
    throw new Error('Invalid User Id');
  }

  const clash = user.organisedEvents.some(event =>
    event.location === location &&
    event.date === date &&
    !(endTime <= event.startTime || startTime >= event.endTime)
  );

  if (clash) {
    throw new Error('Event already exists');
  }

  if (title.length <= 3) {
    throw new Error('Event Title too short');
  } else if (title.length > 30) {
    throw new Error('Event Title too long');
  }

  if (description.length <= 3) {
    throw new Error('Event Description too short');
  } else if (description.length > 30) {
    throw new Error('Event Description too long');
  }

  if (endTime <= startTime) {
    throw new Error('Invalid Event Timing');
  }

  const eventId = Date.now().toString();
  const newEvent: Events = {
    id: eventId,
    title: title,
    description: description,
    location: location,
    date: date,
    startTime: startTime,
    endTime: endTime,
    organiser: userId,
    attendees: [],
    notAttending: []
  };

  store.events.push(newEvent);
  user.organisedEvents.push(newEvent);
  setData(store);
  return newEvent.id;
}

function deleteEvent(userId: string, eventId: string): object {
  const store = getData();
  const userIndex = store.users.findIndex(user => (user.userId === userId));
  const user = store.users[userIndex];

  if (!user) {
    throw new Error('Invalid User Id');
  }

  const eventIndex = user.organisedEvents.findIndex(event => (event.id === eventId));
  const event = user.organisedEvents[eventIndex];
  if (!event) {
    throw new Error('Invalid Event Id');
  }

  user.organisedEvents.splice(eventIndex, 1);
  return {};
}

export { createEvent, deleteEvent };
