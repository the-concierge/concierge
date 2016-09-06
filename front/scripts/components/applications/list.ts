import ko = require("knockout");
import ListEx = require("../lists/listEx");
import ListItem = require('../lists/listItem');
import ApplicationModel = require("./model");
import $ = require("jquery");
import toastr = require("toastr");
const bootbox = require("bootbox");
export = ApplicationList;

class ApplicationList extends ListEx<ApplicationModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);
    }

    isVariablesModalOpen = ko.observable(false);
    currentApplication = ko.observable<Concierge.Application>({ id: 0, name: '', variables: '[]' } as any);
    applictionReference: ApplicationModel;

    cancelVariables = () => {
        this.isVariablesModalOpen(false);
    }

    saveVariables = () => {
        const url = `/applications/${this.currentApplication().id}`;
        const json = JSON.stringify(
            this.currentVariables()
                .map(variable => `${variable.key()}=${variable.value()}`)
        );
        this.applictionReference.variables(json);
        this.isVariablesModalOpen(false);
    }

    addVariable = () => {
        this.currentVariables.push({
            key: ko.observable(''),
            value: ko.observable('')
        });
    }

    deleteVariable = (variable: Variable) => {
        this.currentVariables.destroy(variable);
    }

    editVariables = (app: ListItem<ApplicationModel>) => {
        this.applictionReference = app.item;
        const model = app.saveToModel();
        this.currentVariables.destroyAll();
        this.currentApplication(model);
        
        const variables: string[] = JSON.parse(model.variables);
        const pairs = variables.map(v => {
            const split = v.split('=');
            return { 
                key: ko.observable(split[0]),
                value: ko.observable(split[1])
            }
        });

        this.currentVariables(pairs);
        
        this.isVariablesModalOpen(true);
    }

    currentVariables = ko.observableArray<Variable>([]);
}

interface Variable {
    key: KnockoutObservable<string>;
    value: KnockoutObservable<string>;
}