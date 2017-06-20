export default class StatusError extends Error {
  constructor(public status: number, message: string) {
    super()
  }
}