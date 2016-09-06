import ko = require("knockout");
import ListEx = require("../lists/listEx");
import ConfigModel = require("./model");
export = ConfigList;

class ConfigList extends ListEx<ConfigModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);
    }

    displayedConfig = ko.observable<number>(1);

    isDisplayedConfig(id) {
        return this.displayedConfig() === id;
    }

    rowItems = [
        { key: 'Name', value: 'name', checkbox: false },
        // { key: 'Is Active Configuration', value: 'isActive', checkbox: true },
        { key: 'Concierge: Web Port', value: 'conciergePort', checkbox: false },
        { key: 'Concierge: Use HTTPS', value: 'useHttps', checkbox: true },
        { key: 'Concierge: Use Production Certificates', value: 'useProductionCertificates', checkbox: true },
        { key: 'Concierge: Certificate Registrant Email', value: 'certficateEmail', checkbox: false },
        { key: 'Concierge: HTTP Proxy Port', value: 'httpPort', checkbox: false },
        { key: 'Concierge: HTTPS Proxy Port', value: 'httpsPort', checkbox: false },
        { key: 'Concierge: Proxy Hostname', value: 'proxyHostname', checkbox: false },
        { key: 'Concierge: Proxy Subdomain Blacklist', value: 'subdomainBlacklist', checkbox: false },
        { key: 'Concierge: Inbound Server IP', value: 'proxyIp', checkbox: false },
        { key: 'Concierge: Debug Mode', value: 'debug', checkbox: true },     
        { key: 'Container: Minimum Uptime', value: 'containerMinimumUptime', checkbox: false },
        { key: 'Container: Maximum Retries', value: 'containerMaximumRetries', checkbox: false },
        { key: 'Heartbeats: Frequency (ms)', value: 'heartbeatFrequency', checkbox: false },
        { key: 'Docker: Registry URL', value: 'dockerRegistry', checkbox: false },
    ];
}
