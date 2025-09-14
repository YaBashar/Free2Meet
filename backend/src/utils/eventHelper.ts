
function checkEventConstraints(title: string, description: string, startTime: number, endTime: number): void {
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

export { checkEventConstraints };
