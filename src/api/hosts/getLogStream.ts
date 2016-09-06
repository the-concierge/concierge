import dockerClient from '../dockerClient';
import * as stream from 'stream';

/**
 * Listen to a Host's log stream
 */
export default function get(host: Concierge.Host, callback: (error?: any, event?: string) => void) {
    var client = dockerClient(host);

    client.getEvents({ }, (err, dataStream) => {
        if (err) return callback(err);
        dataStream.on('data', data => callback(null, data.toString()));
    });
}