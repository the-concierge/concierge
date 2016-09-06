import server from './server';
import * as path from 'path';
import * as inert from 'inert';

export default async(() => {
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
    var staticPath = path.join(path.resolve(__dirname, '../../../'), 'front');

    var staticRoute = {
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: staticPath
            }
        }
    }

    server.route(staticRoute);
    return void(0);
});