import * as http from 'http';
import * as log from '../logger';
import getConfigCache, { get as getConfig } from '../api/configurations/get';
import getIP from './get-ip';
import { get as getChallengeValue } from './challenge-server';
import getDomainInfo from './domain-info';
var webServer: http.Server;

export async function startServer() {
    const config = await getConfig();
    webServer = http.createServer((request, response) => {
        const key = request.url.split('/').slice(-1)[0];
        const value = getChallengeValue(key);

        if (!value) {
            response.statusCode = 404;
            response.write('');
            response.end();
            return;
        }

        const domainInfo = getDomainInfo(request.headers.host);

        log.info(`[CHALLENGE] Received request for ${domainInfo.subdomain}`);
        response.statusCode = 200;
        response.write(value);
        response.end();
    });

    const serverIp = await getIP();
    webServer.listen(config.httpPort, err => {
        if (err) {
            return log.error(`Failed to start Challenge server: ${err}`);
        }
        log.info(`Started Challenge server on ${serverIp}:${config.httpPort}`);
    });
}

export function set(key: string, value: string) {
    challenges[key] = value;
}

export function get(key: string) {
    /** Delete after use ??? */
    return challenges[key];
}

const challenges: { [key: string]: string } = {};