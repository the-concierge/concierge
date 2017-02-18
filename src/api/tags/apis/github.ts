import { getHttps } from '../../request'

const privateBaseUrl = 'git@github.com:'
const publicBaseUrl = 'https://github.com/'

async function getTags(application: Concierge.Application) {

  const token = !!application.gitPrivateToken === true
    ? `?access_token=${application.gitPrivateToken}`
    : ''

  const url = `https://api.github.com/repos/${application.gitRepository}/tags${token}`

  const rawResult = await getHttps(url, { timeout: 5000 })
  const rawTags: Array<GithubTag> = JSON.parse(rawResult)
  const tags = rawTags.map(tag => tag.name)
  return tags
}

function getRepository(application: Concierge.Application) {
  const isPrivate = !!(application.gitPrivateKey || '')
  const baseUrl = isPrivate ? privateBaseUrl : publicBaseUrl

  return `${baseUrl}${application.gitRepository}`
}

export default {
  privateBaseUrl,
  publicBaseUrl,
  getTags,
  getRepository
}

type GithubTag = {
  name: string;
  zapball_url: string;
  tarball_url: string;
  commit: {
    sha: string;
    url: string;
  }
}