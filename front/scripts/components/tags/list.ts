import ko = require("knockout");
import $ = require("jquery");
var toastr = require("toastr");
export = TagViewModel;

toastr.options = {
    positionClass: "toast-bottom-right",
    timeOut: 3000,
    showDuration: 300,
    hideDuration: 300
}

class TagViewModel {
    constructor() {
        this.loadApplications();
        this.selectedApplication.subscribe(app => {
            if (app == null || app.id === 0) return;            
            this.loadTags();
            return true;
        });
    }

    selectedApplication = ko.observable<Concierge.Application>({ id: 0, name: '...' } as any);
    applications = ko.observableArray<Concierge.Application>([]);
    tags = ko.observableArray<string>([]);
    selectedTag: KnockoutObservable<Concierge.Variant> = ko.observable(null);
    canDeploy = ko.observable(true);

    loadApplications = () => {
        this.applications.destroyAll();
        $.get('/applications').then(
            apps => this.applications(apps) && this.selectedApplication(apps[0]),
            error => toastr.error(`Failed to retrieve applications: ${error.responseJSON.message}`)
        );
    }

    loadTags = () => {
        const appId = this.selectedApplication().id;
        this.canDeploy(false);
        this.tags.destroyAll();
        $.get(`/tags/remote/${appId}`).then(
            tags => this.tags(tags) && this.selectedTag(tags[0]) && this.canDeploy(true),
            error => toastr.error(`Failed to retrieve variants: ${error.responseJSON.message}`)
        );
    }

    deploy() {
        const app = this.selectedApplication();
        if (app == null || app.id === 0) {
            toastr.warning('Please select a valid application to deploy');
            return;
        }

        const tagToDeploy = this.selectedTag();
        const isValidTag = !!tagToDeploy;
        if (!isValidTag) {
            toastr.warning("Please select a valid tag to deploy");
            return;
        }


        $.post(`/applications/${app.id}/deploy/${tagToDeploy}`)
            .done(() => toastr.success("Variant deployment request sent!"))
            .fail((errors) => {
                toastr.error(
                    "Failed to deploy variant",
                    "Check the developer console for more information");
                this.printResultsToConsole(errors);
            });
    }

    printResultsToConsole(results: string) {
        try {
            var parsedResults: any[] = JSON.parse(results);
            parsedResults.forEach(console.log);
        }
        catch (ex) {
            console.log(results);
        }
    }
}
