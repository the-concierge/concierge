import {get as getConfig} from '../api/configurations/get';

export default function getIP(): Promise<string> {
    return _getIP();
}

const _getIP = async(() => {
    const config = await(getConfig());

    // Use the Configuration.proxyIp address
    // Fallback to '0.0.0.0'
    // All IPs the server can be reached on (external and internal) will match 0.0.0.0    

    const ip = config.proxyIp || '0.0.0.0';
    return ip;
});