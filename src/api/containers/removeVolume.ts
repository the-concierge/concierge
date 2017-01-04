import { posix } from 'path';
import removeDirectory from '../ssh/removeDirectory';
import removeFile from '../ssh/removeFile';
import getVolumePath from '../hosts/volumePath';
import { one as getHost } from '../hosts/get';

export default async function removeVolume(container: Concierge.Container) {
    const host = await getHost(container.host);
    const volumePath = posix.join(
        await getVolumePath(host),
        container.subdomain
    );
    return await removeDirectory(host, volumePath);
}