import getImageInfo from './getImageInfo';

/**
 * Return a list of the volumes that an Image has
 */
export default async function getVolumes(host: Concierge.Host, dockerImage: string) {
    const info = await getImageInfo(host, dockerImage);
    const config = info.ContainerConfig;
    const volumes = config.Volumes || {};

    return Object.keys(volumes);
}