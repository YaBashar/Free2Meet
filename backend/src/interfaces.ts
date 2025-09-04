
export interface Store {
    events: Events[],
    users: Users[],
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
    refreshToken: string[],
    organisedEvents: Events[],
}

export interface UserDetails {
    userId: string,
    name: string,
    email: string,
}
