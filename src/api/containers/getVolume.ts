import * as getHosts from '../hosts/get';
import getDirectory from '../ssh/getDirectoryTar';
import getVolumePath from '../hosts/volumePath'; 
import {posix} from 'path';

/**
 * Retrieve the contents of the volume folder on a Container as a Buffer
 */
export default async((container: Concierge.Container) => {
    const host = await(getHosts.one(container.host));
    const directory = posix.resolve(getVolumePath(host), container.subdomain);
    const buffer = await(getDirectory(host, directory));
    return buffer;
});