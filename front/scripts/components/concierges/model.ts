import ko = require("knockout");
export = ConciergeModel;

class ConciergeModel implements Lists.ViewModel {
    constructor() {
    }

    id = ko.observable<number>(0);
    label = ko.observable<string>("");
    hostname = ko.observable<string>("");
    port = ko.observable<number>(0);

    loadFromModel(model: any) {
        this.id(model.id);
		this.label(model.label);
        this.hostname(model.hostname);
		this.port(model.port);
    }

    saveToModel() {
		return {
            id: this.id(),
            label: this.label(),
            hostname: this.hostname(),
			port: this.port(),
        };
    }
}
