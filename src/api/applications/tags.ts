import gitApi from './gitApi';

/**
 * Get the list of tags for an Application
 */
export default async((application: Concierge.Application): string[] => {
    const api = gitApi(application.gitApiType);
    const tags = await(api.getTags(application));
    return tags;
});

