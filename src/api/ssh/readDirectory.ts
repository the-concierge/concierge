import getSftpClient from './getSftpClient';
import getVolumePath from '../hosts/volumePath';
import * as path from 'path';

/**
 * Determines if a directory on the Host exists
 */
export default async((host: Concierge.Host, directory: string): boolean => {
    let vp = await(getVolumePath(host));
    directory = path.posix.join(
        await(getVolumePath(host)),
        directory || ''
    );

    let sftpClient = await(getSftpClient(host));
    let dirExists = await(readDirectory(sftpClient, directory));
    return dirExists;
});

function readDirectory(client, path: string) {
    var promise = new Promise<boolean>((resolve, reject) => {

        function readdirHandler(error, response) {
            client.end();
            if (!error) return resolve(true);
            if (isNoSuchPathError(error))
                return resolve(false);
            return reject('[READDIR] Failed to read directory: ' + error);
        }

        client.readdir(path, {}, readdirHandler);
    });

    return promise;
}

function isNoSuchPathError(error: any) {
    var errorMessage = error.toString();
    return errorMessage.indexOf('No such') >= 0;
}