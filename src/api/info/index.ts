import * as getHosts from '../hosts/get';
import * as getContainers from '../containers/get';
import obs = require('observers');
import getContainerStream from '../containers/getLogStream';
import getHostStream from '../hosts/getLogStream';
export { info as default }

/**
 * 
 * Currently unused code
 * Designed to replace Host and Container 'events' modules/emitters with observables
 * 
 */
const CONTAINER_STOP_EVENTS = [
    'kill', 'stop', 'die'
]

var info = {
    containers: obs.observeArray<Concierge.Container & Watch>([]),
    hosts: obs.observeArray<Concierge.Host & Watch>([])
}

export const initialise = async(() => {
    let hosts = <Array<Concierge.Host & Watch>>await(getHosts.all());
    hosts.forEach(h => {
        h.online = false;
        h.streaming = false;
        info.hosts.push(h);
        getHostStream(h, hostEvent(h));
    });
    return true;
});

const watchContainer = async((container: Concierge.Container) => {
    getContainerStream(container, containerEvent(container))
});

function containerEvent(container: Concierge.Container) {
    var predicate = (c => c.id === container.id);
    return function(error?: any, event?: string) {

        var containerObservable = info.containers.find(predicate);
        if (error) containerObservable.streaming = false;

        info.containers.update(predicate, containerObservable);
    }
}

function hostEvent(host: Concierge.Host) {
    var predicate = (h => h.id === host.id);
    return function(error?: any, hostEvent?: string) {
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