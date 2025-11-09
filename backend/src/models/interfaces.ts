import mongoose, { Types } from 'mongoose';

export interface Store {
    events: Events[],
    users: Users[],
    invites: EventInvite[],
    attendees: Attendee[]
}

export interface Events {
    id: string,
    title: string,
    description: string,
    location: string,
    date: string,
    startTime: number,
    endTime: number,
    organiser: string,
    attendees: string[],
    notAttending: string[]
}

export interface Attendee {
    userId: string,
    eventId: string,
    name: string,
    startAvailable: number,
    endAvailable: number
}

export interface EventInvite {
    eventId: mongoose.Types.ObjectId,
    link: string
}

export interface UpdateEvents {
    title: string,
    description: string,
    location: string,
    date: string,
    startTime: number,
    endTime: number,
}

export interface Users {
    userId: string,
    name: string,
    password: string,
    email: string,
    numSuccessfulLogins: number,
    numfailedSinceLastLogin: number,
    passwordHistory: string[],
    refreshTokens: string[],
    resetToken: ResetToken,
    organisedEvents: Types.ObjectId[],
    attendingEvents: Types.ObjectId[]
}

export interface ResetToken {
    token: string,
    expiresAt: number
}

export interface UserDetails {
    userId: string,
    name: string,
    email: string,
}
