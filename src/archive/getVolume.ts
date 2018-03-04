import { readFile } from 'fs'
import { join } from 'path'
import archivePath from './archivePath'

/**
 * Fetch an archived volume archive from the local filesystem
 */
export default function get(volume: string) {
  let filePath = join(archivePath(), volume)

  return readFileAsync(filePath)
}

const readFileAsync = (file: string) => {
  const promise = new Promise<Buffer>((resolve, reject) => {
    readFile(file, (err, content) => {
      if (err) {
        return reject(err)
      }
      resolve(content)
    })
  })

  return promise
}
