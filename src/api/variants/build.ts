import fetchTag from '../applications/fetchTag';
import pushImage from './push';
import getDockerClient from '../dockerClient';
import getRegistry from '../registry/getRegistry';
import * as states from '../../types/states';
import * as log from '../../logger';
import * as getHosts from '../hosts/get';
import update from './update';
import hasImage from '../hosts/hasImage';
import DeployedState = states.DeployedState;
import * as emitter from '../events/emitter';
import registryIsOnline from '../registry/isOnline';
import hostIsOnline from '../hosts/isOnline';
import * as  Docker from 'dockerode';

/**
 * Build an Image of an Application from a particular tag
 */
export default async((application: Concierge.Application, tag: string) => {
    const registry = await(getRegistry());
    const hosts = <Concierge.Host[]>await(getHosts.all());
    const availableHost = await(findOnlineHost(hosts));
    const dockerImage = registry.getTaggedImage(application, tag);

    if (!availableHost) {
        throw new Error('Unable to find a suitable Docker host');
    }

    var buildResult = await(buildImage(availableHost, registry, application, tag));
    return buildResult;
});

function buildImage (host: Concierge.Host, registry: Concierge.Registry, application: Concierge.Application, tag: string) {

    var buildResponses = [];

    var imageTag = registry.getTaggedImage(application, tag);
    var client = getDockerClient(host);
    var previousMessage = '';

    return new Promise<{ responses: any[], host: Concierge.Host }>((resolve, reject) => {

        function dataHandler(data) {
            var msg = data.toString();

            log.debug('[BUILD] ' + msg.trim());
            emitter.variant(tag, msg.trim());
            var parsedMsg = tryJsonParse(previousMessage + msg);
            if (!parsedMsg) previousMessage += msg;
            else {
                buildResponses.push(parsedMsg);
                previousMessage = '';
            }
        }

        function endHandler() {
            var isErrors = buildResponses.some(res => !!res['errorDetail']);
            if (isErrors) {
                reject(buildResponses);
                updateVariant(tag, DeployedState.Failed);
                return;
            }

            resolve(<any>{
                responses: buildResponses,
                host
            });
            updateVariant(tag, DeployedState.Deployed);
        }

        const buildPackage = await(fetchTag(application, tag));

        // Do not use any form of cache to execute the build
        // An erroneous or buggy step in the build can be cached and used for future builds which is undesired
        client.buildImage(buildPackage, { t: imageTag, forcerm: true, nocache: true }, (err, res) => {
            if (err) return reject(err);
            res.on('data', dataHandler);
            res.on('end', endHandler);
        });
    });
}

function tryJsonParse(message: string) {
    try {
        var parsed = JSON.parse(message);
        return parsed;
    } catch (ex) {
        return false;
    }
}

function updateVariant(tag: string, state: DeployedState) {
    var variant = {
        name: tag,
        buildState: DeployedState[state],
        buildTime: Date.now()
    };

    return update(variant);
}

var findOnlineHost = async((hosts: Concierge.Host[]) => {
    for (var idx = 0; hosts.length > idx; idx++) {
        var isOnline = await(hostIsOnline(hosts[idx]));
        if (isOnline) return hosts[idx];
    }
    throw new Error('Unable to find online host');
});