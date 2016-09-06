import ko = require('knockout');
var toastr = require('toastr');
import $ = require('jquery');
import socket = require('../../socket');
export = ContainerModel;

class ContainerModel implements Lists.ViewModel {
    constructor() {
        socket.on("stats", this.statsListener);
        this.containerInfo.subscribe(info => {
            var portInfo = info.Ports[0];
            if (!portInfo) this.port(0);
            else this.port(portInfo.PublicPort);
        });
    }
    originalPort: number = 0;

    id = ko.observable(0);
    label = ko.observable('');
    port = ko.observable(0);
    variant = ko.observable('');
    subdomain = ko.observable('');
    applicationId = ko.observable(0);
    applicationName = ko.observable(''); 
    isProxying = ko.observable(false);
    dockerId = ko.observable('');
    host = ko.observable('');
    memory = ko.observable('');
    cpu = ko.observable('');
    containerInfo = ko.observable<any>({});
    variables = ko.observable('');

    hasValidPort = ko.computed<boolean>(() => {
        return this.port() > 0;
    })

    runClass = ko.computed(() => {
        var status = this.containerInfo().Status || "";

        var cssClass = status.substring(0, 2) === "Up"
            ? "success"
            : "danger";

        return cssClass;
    });

    volumeUrl() {
        return "/containers/" + this.id() + "/volume";
    }

    shortDockerId() {
        return this.dockerId().substring(0, 8);
    }

    getLocation() {
        var portText = this.port() > 0
            ? ":" + this.port()
            : ":Down";
        return "http://" + this.host() + portText;
    }

    loadFromModel(model: Concierge.Container) {
        this.id(model.id);
        this.label(model.label);
        this.port(model.port);
        this.variant(model.variant);
        this.subdomain(model.subdomain);
        this.isProxying(model.isProxying === 1);
        this.dockerId(model.dockerId);
        this.host(model.host);
        this.originalPort = model.port;
        this.variables(model.variables);
        this.applicationName(model.applicationName || '[Cloned]');
        this.applicationId(model.applicationId);
    }

    saveToModel() {
        var isProxying = this.isProxying()
            ? 1
            : 0;

        return {
            id: this.id(),
            label: this.label(),
            port: this.originalPort,
            variant: this.variant(),
            subdomain: this.subdomain(),
            isProxying: isProxying,
            dockerId: this.dockerId(),
            variables: this.variables()
        };
    }

    info(field: string) {
        var containerInfo = this.containerInfo();

        var data = containerInfo[field];
        return data || null;
    }
    
    statsListener = (event: Concierge.Event) => {
        if (event.name !== this.subdomain()) return;
        this.memory(event.event.memory);
        this.cpu(event.event.cpu);
    }
}
