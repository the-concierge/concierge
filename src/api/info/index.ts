import * as getHosts from '../hosts/get';
import * as getContainers from '../containers/get';
import obs = require('observers');
import getContainerStream from '../containers/getLogStream';
import getHostStream from '../hosts/getLogStream';

/**
 * 
 * Currently unused code
 * Designed to replace Host and Container 'events' modules/emitters with observables
 * 
 */
const CONTAINER_STOP_EVENTS = [
    'kill', 'stop', 'die'
];

const info = {
    containers: obs.observeArray<Concierge.Container & Watch>([]),
    hosts: obs.observeArray<Concierge.Host & Watch>([])
}

export async function initialise() {
    const hosts = await getHosts.all() as Array<Concierge.Host & Watch>;
    hosts.forEach(host => {
        host.online = false;
        host.streaming = false;
        info.hosts.push(host);
        getHostStream(host, hostEvent(host));
    });
    return true;
}

function watchContainer(container: Concierge.Container) {
    getContainerStream(container, containerEvent(container))
}

function containerEvent(container: Concierge.Container) {
    const predicate = (c => c.id === container.id);
    return function (error?: any, event?: string) {

        const containerObservable = info.containers.find(predicate);
        if (error) containerObservable.streaming = false;

        info.containers.update(predicate, containerObservable);
    }
}

function hostEvent(host: Concierge.Host) {
    var predicate = (h => h.id === host.id);
    return function (error?: any, hostEvent?: string) {
        var hostObservable = info.hosts.find(predicate);

        if (error) hostObservable.streaming = false;
        else hostObservable.streaming = true;

        try {
            var event: HostEvent = JSON.parse(hostEvent);
            var container = info.containers.find(c => c.dockerId === event.id);

            if (!container) return;

            if (CONTAINER_STOP_EVENTS.some(t => t === event.status))
                container.online = false;

            if (event.status === 'start')
                container.online = true;

            info.containers.update(c => c.dockerId === event.id, container);
            info.hosts.update(predicate, hostObservable);
        }
        catch (ex) {
            // Do nothing. Failed to parse the event.
        }

    }
}

interface Watch {
    online: boolean;
    streaming: boolean;
}

interface HostEvent {
    status: string;
    id: string;
    from: string;
    time: number;
}

export { info as default }