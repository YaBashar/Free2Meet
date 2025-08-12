
export interface Store {
    events: Events[]
}

export interface Events {
    id: number,
    title: string, 
    description: string,
    data: string,
    startTime: number,
    endTime: number
}