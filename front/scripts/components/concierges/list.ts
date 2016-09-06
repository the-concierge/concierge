import ko = require("knockout");
import ListEx = require("../lists/listEx");
import ConciergeModel = require("./model");
import $ = require("jquery");
import toastr = require("toastr");
const bootbox = require("bootbox");
export = ConciergeList;

class ConciergeList extends ListEx<ConciergeModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);

    }

    isContainersModalOpen = ko.observable<boolean>(false);
    containers = ko.observableArray<Concierge.Container>([]);
    currentConcierge = ko.observable<ObservableConcierge>({
        label: "",
        hostname: "",
        port: 0
    });

    isCloneModalOpen = ko.observable(false);
    canCloneContainer = ko.observable(true);
    containerSubdomain = ko.observable('');
    currentContainer = ko.observable<Concierge.Container>({ id: 0, label: '', variant: '', variables: '[]' } as any);
    currentVariables = ko.observableArray<{ key: string, value: KnockoutObservable<string> }>([]);
    parsedVariables = ko.computed(() => {
        const vars = this.currentVariables().map(v => `${v.key}=${v.value()}`);
        return JSON.stringify(vars);
    });

    openModal() {
        this.isContainersModalOpen(false);
        this.isContainersModalOpen(true);
    }

    closeCloneModal = () => {
        this.isCloneModalOpen(true);
        this.isCloneModalOpen(false);
        this.isContainersModalOpen(true);
    }


    getContainers(concierge: ConciergeModel) {
        this.containers([]);
        this.openModal();
        this.currentConcierge({
            hostname: concierge.hostname(),
            label: concierge.label(),
            port: concierge.port()
        });

        $.get("/concierges/containers/" + concierge.id())
            .done(containers => {
                if (typeof containers === 'string') {
                    containers = JSON.parse(containers);
                }
                this.containers(containers);
            })
            .fail(error => toastr.error(error));
    }

    volumeUrl(concierge: ObservableConcierge, container: Concierge.Container) {
        var baseUrl = `http://${concierge.hostname}:${concierge.port}`;
        var requestUrl = `/containers/${container.id}/volume`;
        return  baseUrl + requestUrl;
    }
    
    cloneContainer(concierge: ConciergeModel, container: Concierge.Container) {
        this.currentContainer(container);
        const rawVars: string[] = JSON.parse(container.variables);
        const vars = rawVars.map(v => {
            const split = v.split('=');
            return {
                key: split[0],
                value: ko.observable(split[1])
            }
        });
        this.currentVariables.destroyAll();
        this.currentVariables(vars);

        this.isContainersModalOpen(false);
        this.containerSubdomain('');
        this.isCloneModalOpen(true);
    }

    createCloneContainer = () => {
        this.canCloneContainer(false);
        const concierge = this.currentConcierge();
        const container = this.currentContainer();
        const subdomain = this.containerSubdomain();
        container.variables = this.parsedVariables();

        const request = {
            concierge: {
                hostname: concierge.hostname,
                port: concierge.port
            },
            container,
            subdomain
        }

        $.post('/concierges/clone', request)
            .then(
                () => {
                    toastr.success('Successfully cloned container');
                    this.isCloneModalOpen(false);
                    this.canCloneContainer(true);
                },
                error => {
                    toastr.error(`Failed to clone container: ${error.responseJSON.message || error}`);
                    this.canCloneContainer(true);
                }
            )
            
    }
}


interface ObservableConcierge {
    hostname: string;
    label: string;
    port: number;
}