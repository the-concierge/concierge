import * as db from '../configuration/db'
import docker from '../docker'

/**
 * Push a tag to the configured registry (if available)
 * @param tag Non-prefixed image tag -- I.e. Is not prefixed with the registry URL
 */
export default async function push(host: Concierge.Host, imageName: string): Promise<any | void> {
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

  const stream = await imageToPush.push()

  stream.on('error', err => {
    log.error(`Failed to push to registry: ${err}`)
  })

  stream.on('end', () => log.info(`Pushed to registry: ${repo}:${tag}`))
  stream.on('data', data => log.debug(`[${repo}:${tag}] ${data.toString()}`))
}

function getRepoTag(registry: string, originalTag: string): { repo: string, tag: string } | void {
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