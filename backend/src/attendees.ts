import { getData, setData } from './dataStore';

function attendeeAccept(userId: string, inviteLink: string): object {
  const store = getData();
  const userIndex = store.users.findIndex((user) => user.userId === userId);
  const user = store.users[userIndex];

  if (!user) {
    throw new Error('Invalid User ID');
  }

  const invite = store.invites.find((invite) => invite.link === inviteLink);
  console.log(invite);
  if (!invite) {
    throw new Error('Invalid Invite Link');
  }

  const eventIndex = store.events.findIndex((event) => event.id === invite.eventId);
  const event = store.events[eventIndex];
  console.log(event);
  console.log(store.events);

  if (!event) {
    throw new Error('Event does not exist for invite link');
  }

  user.attendingEvents.push(event);
  event.attendees.push(user.name);

  console.log(event.attendees);
  setData(store);
  return {};
}

export { attendeeAccept };
