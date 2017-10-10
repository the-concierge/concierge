export default class StatusError extends Error {
  constructor(public status: number, public message: string) {
    super()
  }
}
