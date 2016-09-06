import getClient from './getClient';
import {posix} from 'path'
import readFile from './readFile';
import exec from './exec';
const resolve = posix.resolve;

/**
 * Pack the contents of a folder on a Host into a tar file
 * Return a promise of a Buffer
 */

export default async((host: Concierge.Host, directory: string) => {
    const tempFile = createTarFile(host, directory);
    const buffer = await(readFile(host, tempFile));
    const isDeleted = removeTarFile(host, tempFile);
    return buffer;
});

function createTarFile(host: Concierge.Host, directory: string) {
    const baseFolder = posix.resolve(directory, '..');
    const lastFolder = directory.split(posix.sep).slice(-1)[0];
    const temporaryFile = `${Date.now().valueOf().toString()}.tar`;

    // Reduce the folder nesting in the archive to one folder
    const command = `(cd ${baseFolder} && tar cf - ${lastFolder} > ${temporaryFile})`;
    
    const result = await(exec(host, command));
    return posix.join(baseFolder, temporaryFile);
}

function removeTarFile(host: Concierge.Host, filename: string) {
    const command = `rm ${filename}`;
    const result = await(exec(host, command));    
    return result;
}