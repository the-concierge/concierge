import server from './server';
import * as log from '../../logger';
import getConfig from '../configurations/get';

export default function initialiseWebServer() {
    let config = getConfig();
    server.connection({
        port: config.conciergePort
    });

    var options: any = {
        clearInvalid: true
    };

    server.state('session', options);

    server.start(() => {
        log.info('Server is listening on port ' + config.conciergePort);
    });
    
    return true;
}
