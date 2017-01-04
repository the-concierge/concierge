import server from './server';
import { Request as HapiRequest } from 'hapi';
import * as path from 'path';
import * as inert from 'inert';

export default function load() {
    server.register(inert, () => { });

    // Load variants route handlers
    require('./variants');

    // Load tags route handlers
    require('./tags');

    // Load containers route handlers
    require('./containers');

    // Load hosts route handlers
    require('./hosts');

    // Load configurations route handlers
    require('./configurations');

    // Load archive route handlers
    require('./archive');

    // Load concierge route handlers
    require('./concierges');

    // Load application route handlers
    require('./applications');

    // Load static route handler
    const staticPath = path.join(path.resolve(__dirname, '../../../'), 'front');

    const staticRoute = {
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: staticPath
            }
        }
    }

    server.route(staticRoute);

    // 404 handler -- Route to application entry point
    type BoomRequest = {
        response: {
            output: {
                statusCode: number;
            }
        }
    };

    server.ext('onPreResponse', (request: HapiRequest & BoomRequest, reply) => {
        if (!request.response.isBoom) return reply.continue();
        if (request.response.output.statusCode !== 404) reply.continue();        
        reply.file(`${staticPath}/index.html`);    
    });
}