export class StatusError extends Error {
  constructor(public message: string, public status: number) {
    super()
  }
}