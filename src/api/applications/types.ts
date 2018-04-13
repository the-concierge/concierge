export enum State {
  NotDetermined = -1,
  Waiting = 0,
  Started = 6,
  Building = 1,
  Failed = 2,
  Successful = 3,
  Inactive = 4,
  Deleted = 5
}

export interface Branch {
  age?: Date
  ref: string
  sha: string
  seen?: Date
}
