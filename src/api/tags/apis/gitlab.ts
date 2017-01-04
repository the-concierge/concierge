import * as request from '../../request';
import getConfig from '../../configurations/get';

const pkg = require('../../../../package.json');

const privateBaseUrl = 'git@gitlab.com:';
const publicBaseUrl = 'https://gitlab.com/'
async function getTags(application: Concierge.Application) {

    const project = encodeURIComponent(application.gitRepository);
    const token = !!application.gitPrivateToken === true
        ? `?private_token=${application.gitPrivateToken}`
        : '';

    const url = `https://gitlab.com/api/v3/projects/${project}/repository/tags${token}`;

    const rawResult = await request.getHttps(url, { timeout: 5000 });
    const rawTags: Array<GitlabTag> = JSON.parse(rawResult);
    const tags = rawTags.map(tag => tag.name);
    return tags;
}

function getRepository(application: Concierge.Application) {
    const isPrivate = !!(application.gitPrivateKey || '');
    const baseUrl = isPrivate ? privateBaseUrl : publicBaseUrl;

    return `${baseUrl}${application.gitRepository}`;
}

export default {
    privateBaseUrl,
    publicBaseUrl,
    getTags,
    getRepository
}

type GitlabTag = {
    name: string;
    message: string | null;
    release: {
        tag_name: string;
        description: string;
    }
    commit: {
        author_name: string;
        author_email: string;
        authored_date: string;
        committed_date: string;
        committer_name: string;
        committer_email: string;
        id: string;
        message: string;
        parents_id: Array<string>;
    }
}