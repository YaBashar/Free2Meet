import { setData, getData } from "./dataStore";

type ErrorMsg = {
  error: string;
};

export function echo(value: string): { value: string } | ErrorMsg {
  if (value === 'echo') {
    return { error: 'You cannot echo the word echo itself' };
  }
  return {
    value,
  };
}


export function clear (): Record<string, never> {
  const store = getData();

  const fs = require('fs');
  fs.truncate('./data.json', 0, function() {});

  store.users = [];
  store.events = [];
  setData(store);
  return {};
}