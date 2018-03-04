export default function getDomainInfo(host: string) {
  if (!host) {
    return { subdomain: '', domain: '' }
  }
  let fullDomain = host
    .replace('https://', '')
    .replace('http://', '')
    .split(':')[0] // Remove any port number

  let split = fullDomain.split('.')

  let subdomain = split[0].toLocaleLowerCase()
  let domain = split
    .slice(1)
    .join('.')
    .toLocaleLowerCase()

  return {
    subdomain: subdomain,
    domain: domain
  }
}
