import { getData, setData } from '../models/dataStore';
import { Events } from '../models/interfaces';

function attendeeRespond(userId: string, inviteLink: string, action: string): object {
  const store = getData();
  const userIndex = store.users.findIndex((user) => user.userId === userId);
  const user = store.users[userIndex];

  if (!user) {
    throw new Error('Invalid User ID');
  }

  const invite = store.invites.find((invite) => invite.link === inviteLink);
  if (!invite) {
    throw new Error('Invalid Invite Link');
  }

  const eventIndex = store.events.findIndex((event) => event.id === invite.eventId);
  const event = store.events[eventIndex];

  if (!event) {
    throw new Error('Event does not exist for invite link');
  }

  if (action === 'accept') {
    user.attendingEvents.push(event);
    event.attendees.push(user.name);

    store.attendees.push({
      userId: user.userId,
      eventId: event.id,
      name: user.name,
      startAvailable: -1,
      endAvailable: -1
    });
  } else if (action === 'reject') {
    event.notAttending.push(user.name);
  }

  setData(store);
  return {};
}

function attendeeSelectAvailability(userId: string, eventId: string, startTime: number, endTime: number) {
  const store = getData();

  const userIndex = store.users.findIndex((user) => user.userId === userId);
  const user = store.users[userIndex];
  if (!user) {
    throw new Error('Invalid User ID');
  }

  const eventIndex = store.events.findIndex((event) => event.id === eventId);
  const event = store.events[eventIndex];
  if (!event) {
    throw new Error('Invalid Event ID');
  }

  if (endTime <= startTime) {
    throw new Error('Invalid Availability Block');
  }

  const attendee = store.attendees.find((attendee) => attendee.eventId === eventId && attendee.userId === userId);
  if (!attendee) {
    throw new Error('Attendee with userId is not part of this Event');
  }

  attendee.startAvailable = startTime;
  attendee.endAvailable = endTime;

  setData(store);
  return {};
}

function attendeeLeaveEvent(userId: string, eventId: string) {
  const store = getData();

  const userIndex = store.users.findIndex((user) => user.userId === userId);
  const user = store.users[userIndex];
  if (!user) {
    throw new Error('Invalid User ID');
  }

  const eventIndex = store.events.findIndex((event) => event.id === eventId);
  const event = store.events[eventIndex];
  if (!event) {
    throw new Error('Invalid Event ID');
  }

  const attendeeIndex = store.attendees.findIndex((attendee) => attendee.eventId === eventId && attendee.userId === userId);
  const attendee = store.attendees[attendeeIndex];
  if (!attendee) {
    throw new Error('Attendee already left');
  }

  user.attendingEvents = user.attendingEvents.filter((e: Events) => e.id !== eventId);
  event.attendees = event.attendees.filter((name: string) => name !== user.name);
  store.attendees.splice(attendeeIndex, 1);
  event.notAttending.push(user.name);

  return {};
}

export { attendeeRespond, attendeeSelectAvailability, attendeeLeaveEvent };
