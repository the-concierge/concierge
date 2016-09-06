import * as ko from 'knockout';
import {get, post} from 'jquery';
import Application = Concierge.Application;
export = ApplicationModel;

class ApplicationModel implements Lists.ViewModel {
    constructor() {
    }

    id = ko.observable(0);
    name = ko.observable('');
    gitRepository = ko.observable('');
    gitPrivateToken = ko.observable('');
    gitPrivateKey = ko.observable('');
    dockerNamespace = ko.observable('');
    variables = ko.observable('[]');

    availableApis = ko.observableArray(['github', 'gitlab']);
    gitApiType = ko.observable(this.availableApis()[0]);

    originalModel: Application;

    loadFromModel(model: Application) {
        this.originalModel = model;
        Object.keys(model)
            .forEach(key => this[key](model[key]));
    }

    saveToModel(): Application {
        const model = {
            id: this.id(),
            name: this.name(),
            gitApiType: this.gitApiType(),
            gitRepository: this.gitRepository(),
            gitPrivateToken: this.gitPrivateToken(),
            gitPrivateKey: this.gitPrivateKey(),
            dockerNamespace: this.dockerNamespace(),
            variables: this.variables()
        }

        if (this.originalModel && model.gitPrivateKey === this.originalModel.gitPrivateKey) {
            delete model.gitPrivateKey;
        }

        if (this.originalModel && model.gitPrivateToken === this.originalModel.gitPrivateToken) {
            delete model.gitPrivateToken;
        }

        return model;
    }
}

