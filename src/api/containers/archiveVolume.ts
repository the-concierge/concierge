import getVolume from './getVolume';
import * as getApps from '../applications/get';
import removeVolume from './removeVolume';
import { writeFile } from 'fs';
import { resolve } from 'path';
import archivePath from '../archive/archivePath';

/**
 * 1. Fetch the application data of a container
 * 2. Pipe the data into a tar archive
 * 3. Store the tar archive on the file system
 */

export default async((container: Concierge.Container) => {
    try {
        let db = await(getVolume(container));
        const writeResult = archiveVolume(container, db);
        return await(removeVolume(container));
    }
    catch (ex) {
        var msg = ex.toString();
        var noSuchFile = msg.indexOf('No such file') > -1;
        if (noSuchFile) return true;
        throw new Error(msg);
    }
})

function archiveVolume(container: Concierge.Container, volume: any) {
    const app = await(getApps.one(container.applicationId));
    const appName = app ? app.name : 'CLONED';
    
	const volumeFileName = `${appName}_${container.subdomain}_${container.variant}_${Date.now().valueOf()}.tar`;
	const archiveFilePath = resolve(archivePath(), volumeFileName);
    const writeResult = await(writeFileAsync(archiveFilePath, volume));
	return writeResult;
}

const writeFileAsync = (filePath: string, contents: any) => {
	const promise = new Promise((resolve, reject) => {
		writeFile(filePath, contents, (err) => {
			if (err) return reject(err);
			resolve(true);
		});
	});

	return promise;
}