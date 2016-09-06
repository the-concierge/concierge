import { posix } from 'path';
import removeDirectory from '../ssh/removeDirectory';
import removeFile from '../ssh/removeFile';
import getVolumePath from '../hosts/volumePath';
import { one as getHost } from '../hosts/get';

export default async((container: Concierge.Container) => {
    let host = await(getHost(container.host));    
    let volumePath = posix.join(
        await(getVolumePath(host)),
        container.subdomain
    );
    return await(removeDirectory(host, volumePath));
});