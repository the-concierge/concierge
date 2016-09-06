import dockerClient from '../dockerClient';
import * as stream from 'stream';
import * as getHost from '../hosts/get';
import * as log from '../../logger';
import * as events from 'events';
import Docker from 'dockerode-ts';

export default function get(container: Concierge.Container, callback: (err?: any, stats?: any) => any, endCallback?: () => void): Promise<any> {
    var request = client => getStats(container, client, callback, endCallback);

    return getHost.one(container.host)
        .then(dockerClient)
        .then(request);
}

function getStats(container: Concierge.Container, client: Docker, callback: (err?: any, stats?: any) => any, endCallback?: () => void) {
    var stats = '';
    endCallback = endCallback || (() => {});

    var parse = data => {
        stats += data.toString();
        var parsed = tryJsonParse(stats);
        if (!parsed) return;
        stats = '';
        callback(null, parsed);
    }

    var dataCallback = (err, data: stream.Readable) => {
        if (err) return callback(err);

        data.on('data', parse);
        data.on('end', endCallback);
        data.on('error', endCallback);
        data.on('abort', endCallback);
    }

    client.getContainer(container.dockerId)
        .stats(dataCallback)
}

function tryJsonParse(data: string) {
    try {
        var output = JSON.parse(data);
        return output;
    } catch (ex) {
        return null;
    }
}