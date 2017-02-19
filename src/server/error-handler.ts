import { ErrorRequestHandler } from 'express'
import { StatusError } from './error'
import * as logger from '../logger'
import * as path from 'path'

const isProduction = process.env.NODE_ENV === 'production'
const staticPath = path.resolve(__dirname, '..', 'front')

const handler: ErrorRequestHandler = (error: Error | StatusError | any, _, res) => {
  if (error instanceof StatusError) {
    res
      .status(error.status)
      .json({ message: error.message })

    logger.warn(error.message)
    logger.warn(error.stack)
    return
  }

  if (error instanceof Error) {
    const errorObject = isProduction
      ? { message: error.message }
      : { message: error.message, stack: error.stack }

    console.log(JSON.stringify(errorObject, null, 2)) //tslint:disable-line
    res
      .status(500)
      .sendFile(path.resolve(staticPath, 'index.html'))

    logger.warn(error.message)
    return
  }

  res
    .status(500)
    .sendFile(path.resolve(staticPath, 'index.html'))

  logger.error('Unexpected error occurred:')
  logger.error(JSON.stringify(error, null, 2))
}

export default handler