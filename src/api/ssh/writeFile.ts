import { posix } from 'path';
import getSftpClient from './getSftpClient';
import getVolumePath from '../hosts/volumePath';

/**
 * Create a file on the Host
 */
export default async function writeFile(host: Concierge.Host, filename: string, data: Buffer): Promise<boolean> {
    const client = await getSftpClient(host);
    const success = await write(client, filename, data);
    return success;
}

function write(client, filePath: string, data: Buffer) {
    const promise = new Promise<boolean>((resolve, reject) => {

        function readFileHandler(error, response) {
            client.end();
            if (error)
                return reject('[WRITEFILE] Failed to read file: ' + error);

            resolve(true);
        }

        client.writeFile(filePath, data, {}, readFileHandler);
    });

    return promise;
}