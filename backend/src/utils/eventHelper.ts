import { EventType } from '../models/eventModel';

export function checkDateConstraints(eventType: EventType, startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }

  if (eventType === EventType.Single) {
    if (startDate !== endDate) {
      throw new Error('Single day events must have the same start and end date');
    }
  } else {
    if (end <= start) {
      throw new Error('Multi-day events must have an end date after the start date');
    }
  }
}

export function checkEventConstraints(title: string, description: string, startTime: number, endTime: number): void {
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
}

