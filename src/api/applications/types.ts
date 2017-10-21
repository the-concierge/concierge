export enum State {
  Waiting = 0,
  Building = 1,
  Failed = 2,
  Successful = 3,
  Inactive = 4
}

export interface Branch {
  age?: Date
  ref: string
  sha: string
  seen?: Date
}
