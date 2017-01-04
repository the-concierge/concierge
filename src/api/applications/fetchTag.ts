import * as childProcess from 'child_process';
import gitApi from './gitApi';
import tags from './tags';
import appPath from './appPath';
import * as tar from 'tar-fs';
import gitCmd from './gitCmd';

let sentinal: { [id: number]: boolean } = {};

/**
 * Get Application source code for a particular Git tag
 * This has a direct impact on the filesystem
 */
export default async function fetchTag(application: Concierge.Application, tag: string): Promise<NodeJS.ReadableStream> {
    if (sentinal[application.id]) {
        throw new Error(`Applcation ${application.name} is already fetching`);
    }

    sentinal[application.id] = true;

    const workingDirectory = appPath(application);

    // Fetch the tags from the remote repository
    const fetchCmd = 'git fetch origin --tags';

    // Checkout the tag
    const checkoutCmd = `git checkout ${tag}`;

    try {
        const fetchResult = await gitCmd(application, workingDirectory, fetchCmd);
        const checkoutResult = await gitCmd(application, workingDirectory, checkoutCmd);
        const stream = tar.pack(workingDirectory);
        return stream;
    }
    finally {
        sentinal[application.id] = false;
    }
};