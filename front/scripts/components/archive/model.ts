import ko = require("knockout");
export = ArchiveModel;

class ArchiveModel implements Lists.ViewModel {
    constructor() {
    }

    application = ko.observable('');
    filename = ko.observable('');
    subdomain = ko.observable('');
    timestamp = ko.observable(0);
    variant = ko.observable('');
    date = ko.observable('');

    loadFromModel(model: Concierge.Archive) {
        this.application(model.application);
        this.subdomain(model.subdomain);
        this.timestamp(model.timestamp);
        this.variant(model.variant);
        this.date(model.date);
        this.filename(model.filename);
    }

    saveToModel(): Concierge.Archive {
        return {
            application: this.application(),
            filename: this.filename(),
            subdomain: this.subdomain(),
            variant: this.variant(),
            timestamp: this.timestamp(),
            date: this.date()
        };
    }

    databaseLink = ko.computed(() => {
        return "/archive/" + this.filename()
    });
}
