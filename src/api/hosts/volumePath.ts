import { posix } from 'path'
import getConfig from '../configurations/get'

/**
 * Return the base Volume path for a Host
 */
export default function getVolumePath(host: Concierge.Host): string {
  let config = getConfig()
  let path = posix.join('/home', host.sshUsername, config.name)
  return path
};