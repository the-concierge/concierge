import * as db from '../configuration/db'
import docker, { getAuthConfig } from '../docker'
import { toast } from '../stats/emitter'

/**
 * Push a tag to the configured registry (if available)
 * @param tag Non-prefixed image tag -- I.e. Is not prefixed with the registry URL
 */
export default async function push(host: Schema.Host, imageName: string): Promise<any | void> {
  const client = docker(host)
  const config = await db.get()

  if (!config.dockerRegistry) {
    return
  }

  // This is the registry configured by default
  // Do not attempt to push to the default registry as it doesn't exist
  const defaultRegistry = '0.0.0.0:5000'
  if (config.dockerRegistry === defaultRegistry) {
    return
  }

  const image = client.getImage(imageName)
  const registry = config.dockerRegistry
  const pushInfo = getRepoTag(registry, imageName)
  if (!pushInfo) {
    return
  }

  const { repo, tag } = pushInfo

  await image.tag({
    repo,
    tag
  })

  const imageToPush = client.getImage(`${repo}:${tag}`)

  log.info(`Pushing to registry: ${repo}:${tag}`)
  const authconfig = await getAuthConfig()

  try {
    const stream = await imageToPush.push({ insecure: true, authconfig })

    stream.on('error', (err: any) => {
      log.error(`Failed to push to registry: ${err.message || err}`)
    })

    let isSuccessful = true
    stream.on('data', data => {
      try {
        const json = JSON.parse(data)
        if (!json.errorDetail) {
          return
        }
        isSuccessful = false
        const msg = `Failed to push image ${repo}:${tag}: ${json.errorDetail.message}`
        log.error(msg)
        toast('error', msg)
      } catch (ex) {
        const raw: string = data.toString()
        if (raw.indexOf('errorDetail') === -1) {
          return
        }

        isSuccessful = false
        const msg = `Failed to push image ${repo}:${tag}: Raw Event: ${raw}`
        log.error(msg)
        toast('error', msg)
      }
    })

    stream.on('end', () => {
      if (isSuccessful) {
        log.info(`Pushed to registry: ${repo}:${tag}`)
        toast('success', `Successfully pushed ${repo}:${tag} to registry`)
      }
    })
  } catch (ex) {
    log.error(`Failed to push to registry: ${ex.message || ex}`)
  }
}

function getRepoTag(registry: string, originalTag: string): { repo: string; tag: string } | void {
  const split = originalTag.split(':')
  const repo = split.slice(0, -1).join(':')
  const tag = split.slice(-1)[0]

  if (!repo) {
    log.error(`Invalid image supplied: Did not return a valid repository`)
    return
  }

  if (!tag) {
    log.error(`Invalid image supplied: Did not return a valid tag`)
  }

  return {
    repo: `${registry}/${repo}`,
    tag
  }
}
