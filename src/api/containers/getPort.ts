import getContainerInfo from './getInfo';

/**
 * Get the exposed port number of a Container
 */
export default async((container: Concierge.Container) => {
    const containerInfo = await(getContainerInfo(container));
    var ports = containerInfo.NetworkSettings.Ports;
    var dockerPort = Object.keys(ports)[0];
    var hostPort = ports[dockerPort][0].HostPort;

    return Number(hostPort);
});