import ko = require("knockout");
import $ = require("jquery");
const toastr = require("toastr");
export = ConfigModel;

class ConfigModel implements Lists.ViewModel {
    constructor() {
    }

    id = ko.observable(0);
    name = ko.observable('');
    conciergePort = ko.observable(0);
    httpPort = ko.observable(0);
    httpsPort = ko.observable(0);
    proxyHostname = ko.observable('');
    proxyIp = ko.observable('');
    subdomainBlacklist = ko.observable('');
    useHttps = ko.observable(false);
    useProductionCertificates = ko.observable(false);
    debug = ko.observable(false);
    containerMinimumUptime = ko.observable(0);
    containerMaximumRetries = ko.observable(0);
    heartbeatFrequency = ko.observable(0);
    heartbeatBinSize = ko.observable(0);
    isActive = ko.observable(false);
    dockerRegistry = ko.observable('');
    certificateEmail = ko.observable('');        

    loadFromModel(model: Concierge.Configuration) {
        this.id(model.id);
        this.name(model.name);
        this.conciergePort(model.conciergePort);
        this.httpPort(model.httpPort);
        this.httpsPort(model.httpsPort);
        this.proxyHostname(model.proxyHostname);
        this.subdomainBlacklist(model.subdomainBlacklist);
        this.proxyIp(model.proxyIp);
        this.useHttps(Number(model.useHttps) === 1);
        this.useProductionCertificates(Number(model.useProductionCertificates) === 1);
        this.certificateEmail(model.certificateEmail);
        this.debug(Number(model.debug) === 1);
        this.containerMinimumUptime(model.containerMinimumUptime);
        this.containerMaximumRetries(model.containerMaximumRetries);
        this.heartbeatFrequency(model.heartbeatFrequency);
        this.heartbeatBinSize(model.heartbeatBinSize);
        this.isActive(Number(model.isActive) === 1);        
        this.dockerRegistry(model.dockerRegistry);
    }

    saveToModel(): Concierge.Configuration {
        const num = (value: boolean) => value ? 1 : 0;

        return {
            id: this.id(),
            name: this.name(),
            conciergePort: this.conciergePort(),
            httpPort: this.httpPort(),
            httpsPort: this.httpsPort(),
            proxyHostname: this.proxyHostname(),
            certificateEmail: this.certificateEmail(),
            proxyIp: this.proxyIp(),
            subdomainBlacklist: this.subdomainBlacklist(),
            debug: num(this.debug()),
            useProductionCertificates: num(this.useProductionCertificates()),
            useHttps: num(this.useHttps()),                      
            containerMinimumUptime: this.containerMinimumUptime(),
            containerMaximumRetries: this.containerMaximumRetries(),
            heartbeatFrequency: this.heartbeatFrequency(),
            heartbeatBinSize: this.heartbeatBinSize(),
            isActive: num(this.isActive()),
            dockerRegistry: this.dockerRegistry(),
        };
    }


}
