import isOnline from './isOnline';
import * as getHosts from './get';
import * as getContainers from '../containers/get';

/**
 * Locate the Host that has the least amount of Containers running
 */
export default function getHostForContainer(): Promise<Concierge.Host> {
    var hosts = getHosts.all();
    var containers = getContainers.all();

    return Promise.all([hosts, containers])
        .then(getHostLoads)
        .then(getLowestLoadedHost);

}

function getHostLoads(promiseResult: any[]): Promise<any> {
    var hosts: Concierge.Host[] = promiseResult[0];
    var containers: Concierge.Container[] = promiseResult[1];

    var hasHosts = hosts.length > 0;
    if (!hasHosts) return Promise.reject('[HOST.ALLOCATE] There are no hosts available. Please assign at least one.');

    var hostLoads = hosts.map(host => hostLoadPercentage(host, containers));
    return Promise.resolve(hostLoads);
}

const getLowestLoadedHost = async((hosts: Concierge.Host[]) => {
    var orderedHosts = hosts.slice().sort((l, r) => l.capacity - r.capacity);
    
    // Find the first online in the array of hosts
    var toOnlineHostIndex = (hostIndex, hostIsOnline, index) => {
        if (hostIndex === -1 && hostIsOnline === true) hostIndex = index;
        return hostIndex;
    }

    const hostStatuses = orderedHosts.map(host => await(isOnline(host)));
    const onlineHostIndex = hostStatuses.reduce(toOnlineHostIndex, -1);
    if (onlineHostIndex === -1) {
        throw new Error('No hosts are currently online');
    }
    return orderedHosts[onlineHostIndex];
});

function hostLoadPercentage(host: Concierge.Host, containers: Concierge.Container[]) {

    var hostedCount = containers.reduce((count, current) => {
        var isMatching = current.host === host.hostname;
        if (isMatching) count++;
        return count;
    }, 0);


    var load = Math.round((hostedCount / host.capacity) * 10000) / 100;
    host.capacity = load;
    return host;
}