import { getData, setData } from './dataStore';

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
