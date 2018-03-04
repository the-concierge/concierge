import getConfig from '../configurations/get'

/**
 * Return an object 'utility helper' for resolving application variant/image paths
 */
export default async function getRegistry(): Promise<Concierge.Registry> {
  const config = await getConfig()

  const details: Concierge.Registry = {
    url: config.dockerRegistry,
    getUntaggedImage: function(application: Concierge.Application) {
      return `${this.url}/${application.dockerNamespace}`
    },
    getTaggedImage: function(application: Concierge.Application, tag: string) {
      return `${this.url}/${application.dockerNamespace}:${tag}`
    }
  }

  return details
}
