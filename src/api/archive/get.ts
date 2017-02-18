import { readdir } from 'fs'
import { extname } from 'path'
import * as moment from 'moment'
import archivePath from './archivePath'

export default function get() {
  return readdirAsync(archivePath())
    .then((files: string[]) => {
      const volumeArchives = files.filter(file => extname(file) === '.tar')

      const archive = volumeArchives.map(mapFile)
      const sortedArchive = archive.sort((left, right) => {
        return right.timestamp - left.timestamp
      })

      return sortedArchive
    })
}

function mapFile(file: string): Concierge.Archive {
  // Assumptions: applicationName_subdomain_variant_timestamp
  // subdomain and timestamp never contains underscores
  // variant name could possibly contain underscores

  const split = file.split('_')
  const applicationName = split[0]
  const subdomain = split[1]
  const timestamp = Number(split.slice(-1).join('').replace('.tar', ''))
  const variant = split.slice(2, -1).join('')

  return {
    application: applicationName,
    filename: file,
    subdomain: subdomain,
    timestamp: timestamp,
    variant: variant,
    date: moment(timestamp).format('DD/MMM/YYYY HH:mm:ss')
  }
}

const readdirAsync = (file: string) => {
  const promise = new Promise((resolve, reject) => {
    readdir(file, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })

  return promise
}