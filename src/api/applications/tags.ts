import gitApi from './gitApi';

/**
 * Get the list of tags for an Application
 */
export default async function getTags(application: Concierge.Application): Promise<string[]> {
    const api = gitApi(application.gitApiType);
    const tags = await(api.getTags(application));
    return tags;
}
