import httpsServer from './https-server';
import httpServer from './http-server';
import {get as getConfig} from '../api/configurations/get';

export default async(() => {
    const config = await(getConfig());
    
    if (!!config.useHttps) {
        await(httpServer.stopServer());
        await(httpsServer.startServer());
    }
    else {
        await(httpsServer.stopServer());
        await(httpServer.startServer());
    }
});