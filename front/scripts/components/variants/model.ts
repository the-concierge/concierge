import ko = require("knockout");
import $ = require("jquery");
export = VariantModel;
var toastr = require("toastr");

class VariantModel implements Lists.ViewModel {
    constructor() {
    }

    name = ko.observable('');
    application = ko.observable('');
    buildState = ko.observable('');
    buildTime = ko.observable(0);

    loadFromModel(model: any) {
        this.name(model.name);
        this.application(model.application);
        this.buildState(model.buildState);
        this.buildTime(model.buildTime);
    }

    saveToModel() {
        return {
            name: this.name(),
            application: this.application(),
            buildState: this.buildState(),
            buildTime: this.buildTime()
        };
    }
    
    pullToAll(variant: any) {
        var url = "/variants/" + variant.name() + "/pullToAll";
        $.post(url)
            .done(toastr.success)
            .fail(toastr.error);
    }
}
