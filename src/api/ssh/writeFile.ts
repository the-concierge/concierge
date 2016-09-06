import { posix } from 'path';
import getSftpClient from './getSftpClient';
import getVolumePath from '../hosts/volumePath';

/**
 * Create a file on the Host
 */
export default async((host: Concierge.Host, filename: string, data: Buffer): boolean => {    
    let client = await(getSftpClient(host));
    let success = await(writeFile(client, filename, data));
    return success;
});

function writeFile(client, filePath: string, data: Buffer) {
    var promise = new Promise<boolean>((resolve, reject) => {

        function readFileHandler(error, response) {
            client.end();
            if (error)
                return reject('[WRITEFILE] Failed to read file: ' + error);

            resolve(<any>true);
        }

        client.writeFile(filePath, data, {}, readFileHandler);
    });

    return promise;
}