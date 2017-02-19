import getImages from './getImages'

/**
 * Determine if a Host is online/available
 */
export default function isOnline(host: Concierge.Host): Promise<boolean> {
  return getImages(host)
    .then(() => true)
    .catch(() => false)
}