import ko = require("knockout");
var toastr = require("toastr");
export = HostModel;

class HostModel implements Lists.ViewModel {
    constructor() {}
    
    /**
     * Typical defaults when creating a new host
     */
    id = ko.observable<number>(0);
    hostname = ko.observable<string>('');
    capacity = ko.observable<number>(5);
    dockerPort = ko.observable<number>(2375);
    sshPort = ko.observable<number>(22);
    sshUsername = ko.observable<string>('');
    privateKey = ko.observable<string>('');

    originalModel: Concierge.Host;

    loadFromModel(model: Concierge.Host) {
        this.originalModel = model;

        this.id(model.id);
        this.hostname(model.hostname);
        this.capacity(model.capacity);
        this.dockerPort(model.dockerPort);
        this.sshPort(model.sshPort);
        this.sshUsername(model.sshUsername);
        this.privateKey(model.privateKey);
    }

    saveToModel(): Concierge.Host {
        const model = {
            id: this.id(),
            hostname: this.hostname(),
            capacity: this.capacity(),
            dockerPort: this.dockerPort(),
            sshPort: this.sshPort(),
            sshUsername: this.sshUsername(),
            privateKey: this.privateKey()
        };

        if (this.originalModel && this.originalModel.privateKey === model.privateKey) {
            delete model.privateKey;
        }

        return model;
    }
    
    pullAllVariants = () => {
        var route = "/hosts/" + this.hostname() + "/pullAll";
        $.post(route)
            .done(toastr.success)
            .fail(toastr.error)
    }
}
