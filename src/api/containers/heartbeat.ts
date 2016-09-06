import * as request from '../request';

/**
 * Send a GET request to the Container and record the round-trip time 
 */
export default function heartbeat(container: Concierge.Container): Promise<number> {
    var startTime = Date.now();
    var url = 'http://' + container.host + ':' + container.port;
    
    return request.get(url)
        .then(() => Promise.resolve(Date.now() - startTime))
        .catch(err => -1);    
}
