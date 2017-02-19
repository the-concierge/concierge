import * as tar from 'tar-fs'

/**
 * Pack a Dockerfile into a tar archive
 */
export default function createPack(inputPath: string) {
  let pack = tar.pack(inputPath, {
    entries: ['Dockerfile']
  })
  return pack
}
