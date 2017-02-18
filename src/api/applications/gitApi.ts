import git from '../tags'

export default function getApi(apiType: string): Concierge.SourceControlApi {
  const api = git[apiType] || badApi
  return api
}

const badApi: Concierge.SourceControlApi = {
  getTags: (application: Concierge.Application) => { throw new Error('Application does not have a valid Git API configured') },
  getRepository: () => { throw new Error('Application does not have a valid Git API configured') },
  privateBaseUrl: null,
  publicBaseUrl: null
}