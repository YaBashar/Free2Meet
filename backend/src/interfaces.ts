
export interface Store {
    events: Events[],
    users: Users[],
}

export interface Events {
    id: number,
    title: string, 
    description: string,
    data: string,
    startTime: number,
    endTime: number
}

export interface Users {
    userId: string,
    name: string,
    password: string,
    email: string,
    numSuccessfulLogins: number,
    numfailedSinceLastLogin: number,
    passwordHistory: string[],
    refreshToken: string[]
}

export interface UserDetails {
    userId: string,
    name: string,
    email: string,
}
