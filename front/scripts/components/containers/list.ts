import ko = require("knockout");
import ListEx = require("../lists/listEx");
import ContainerModel = require("./model");
import $ = require("jquery");
import statsChart = require("./statsChart");
var bootbox = require("bootbox");
import toastr = require("toastr");
import socket = require("../../socket");
export = ContainerList;

class ContainerList extends ListEx<ContainerModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);
        statsChart.teardown();

        this.loadListData();
        this.getAllContainerInfo();

        if (window.containerPoller) clearTimeout(window.containerPoller);
        this.isPolling.subscribe(isOn => {
            if (isOn) this.getAllContainerInfo();
            else clearTimeout(window.containerPoller);
        });

        this.teardown();

        this.selectedApplication.subscribe(application => {
            if (application == null || application.id === 0) return;
            $.get(`/variants/${application.id}/deployed`)
                .then(variants => {
                    this.variants.destroyAll();
                    this.variants(variants);
                    this.selectedVariant(variants[0]);
                });

            const variables = JSON.parse(application.variables || '[]');
            this.loadExistingVariables(variables);
        });

        this.selectedContainer.subscribe(container => {
            const appId = container.applicationId();
            if (appId == null || appId === 0) return;
            const app = this.applications().filter(app => app.id === appId)[0];
            if (app != null) this.selectedApplication(app);
        });

    }

    teardown = () => {
        socket['removeAllListeners']('stats');
        socket.on('stats', this.statsListener);
    }

    containers = ko.observableArray<any>([]);
    remoteContainers = ko.observable("");

    // Polling for Docker Container Information
    isPolling = ko.observable<boolean>(true);

    // New Container Modal    
    variants = ko.observableArray<Concierge.Variant>([]);
    applications = ko.observableArray<Concierge.Application>([]);


    selectedContainer = ko.observable<ContainerModel>({ id: ko.observable(0), applicationId: ko.observable(0) } as any);
    selectedApplication = ko.observable<Concierge.Application>({ id: 0, name: '', variables: '[]' } as any);
    selectedVariant = ko.observable<Concierge.Variant>({id: 0, name: '...'} as any);
    selectedSubdomain = ko.observable<string>("");
    selectedLabel = ko.observable<string>("");
    selectedVolume = ko.observable<any>();
    isModalOpen = ko.observable<boolean>(false);
    variables = ko.observableArray<{ key: string, value: string }>([]);

    // New Container Modal: Forking/Changing 
    targetContainerId = ko.observable<number>(0);
    containerRequestUrl = ko.observable<string>("");
    newContainerTitle = ko.observable<string>("");

    // Container statistics
    containerStatsId = ko.observable<number>(0);
    containerStatsName = ko.observable<string>("");
    containerStats = ko.observableArray<any>([]);
    isStatsModalOpen = ko.observable<boolean>(false);

    isLabelEditable = ko.computed(() => {
        return this.containerRequestUrl().length === 0;
    });
    isSubdomainEditable = ko.computed(() => {
        return this.containerRequestUrl() !== "/change"; // TODO: Remove string typing
    });
    isVolumeEditable = ko.computed(() => {
        var isEditable = this.containerRequestUrl() !== "/fork"; // TODO: Remove string typings
        return isEditable;
    });


    showApplications = ko.observable(true);
    isInfoModalOpen = ko.observable<boolean>(false);
    containerInfo = ko.observable()
    infoContainerId = ko.observable(0);

    displayContainerInfo = ko.computed(() => {
        var display = this.infoContainerId() > 0;
        return display;
    });

    reloadFromServer = () => {
        this.teardown();
        this.loadFromServer();
    }

    deleteContainer() {
        var id = this.infoContainerId();
        bootbox.confirm("Are you sure you wish to delete this container?", result => {
            if (!result) return;

            $.ajax({
                url: "/containers/" + id,
                type: "DELETE"
            }).done(() => {
                toastr.success("Container has been deleted");
                this.reloadFromServer();
            }).fail(error => {
                toastr.error("Failed to delete container: " + error.responseJSON.message || error);
            });
            this.isInfoModalOpen(false);
        });
    }

    stopContainer() {
        var id = this.infoContainerId();
        $.post("/containers/" + id + "/stop")
            .done(data => {
                toastr.success("Container successfully stopped");
                this.infoContainerId(0);
                this.infoContainerId(id);
            })
            .fail(error => toastr.error("Container failed to stop: " + error));
    }

    startContainer() {
        var id = this.infoContainerId();
        $.post("/containers/" + id + "/start")
            .done(data => {
                toastr.success("Container successfully started");
                this.infoContainerId(0);
                this.infoContainerId(id);
            })
            .fail(error => toastr.error("Container failed to start: " + error));
    }

    fork(container: ContainerModel) {
        this.selectedContainer(container);
        this.showApplications(false);
        this.targetContainerId(container.id());
        this.isModalOpen(false);
        this.isModalOpen(true);
        this.containerRequestUrl("/fork");
        this.selectedLabel(container.label());
        this.selectedSubdomain("");
        this.newContainerTitle("Duplicate Container");
        this.selectedVolume().clear();

        let existingVars: string[] = JSON.parse(container.variables());
        this.replaceExistingVariables(existingVars);
    }

    change(container: ContainerModel) {
        this.selectedContainer(container);
        this.showApplications(false);
        this.targetContainerId(container.id());
        this.isModalOpen(false);
        this.isModalOpen(true);
        this.containerRequestUrl("/change");
        this.selectedLabel(container.label());
        this.selectedSubdomain(container.subdomain());
        this.newContainerTitle("Change Container Variant");

        let existingVars: string[] = JSON.parse(container.variables());
        this.replaceExistingVariables(existingVars);        
    }

    openCreateModal() {
        this.loadListData();
        this.showApplications(true);
        this.isModalOpen(false);
        this.isModalOpen(true);
        this.newContainerTitle("Create New Container");
        this.containerRequestUrl("");
    }

    loadExistingVariables(existingVars: string[]) {
        this.variables.destroyAll();
        const newVariables = existingVars.map(existingVar => {
                let split = existingVar.split('=');
                let key = split[0];
                let value = split[1];
                return { key, value }
            });
        this.variables(newVariables);
    }

    replaceExistingVariables(existingVars: string[]) {
        this.variables.destroyAll();
        const split = (keyValue: string) => ({ key: keyValue.split('=')[0], value: keyValue.split('=')[1] });
        const push = pair => this.variables.push(pair);
        existingVars.map(split).forEach(push);
    }

    loadListData() {
        $.get('/applications').then(
            apps => this.applications(apps),
            err => toastr.error('Failed to load applications')
        );
    }


    closeCreateModal() {
        this.isModalOpen(false);
    }

    saveContainer() {
        // Fork can never inject a volume
        if (this.containerRequestUrl() === "/fork")
            this.selectedVolume().clear();

        var formData = new FormData();
        var variables = this.variables().map(v => `${v.key}=${v.value}`);

        formData.append('variant', this.selectedVariant().name);
        formData.append('applicationId', this.selectedApplication().id);
        formData.append('subdomain', this.selectedSubdomain());
        formData.append('label', this.selectedLabel());
        formData.append('volume', this.selectedVolume().file());
        formData.append('variables', JSON.stringify(variables));

        var requestUrl = this.containerRequestUrl();

        var url = requestUrl.length > 0
            ? "/containers/" + this.targetContainerId() + requestUrl
            : "/containers"

        $.ajax({
            url: url,
            type: "PUT",
            data: formData,
            processData: false,
            contentType: false
        }).done(() => {
            this.closeCreateModal();
            this.reloadFromServer();
            toastr.success("Container creation successful");
        }).fail(error => {
            var response = JSON.parse(error.responseText);
            toastr.error("Failed to create container: " + response.message);
        });

        toastr.info("Container creation request has been sent");
        this.isModalOpen(false);
    }

    getInfo(id) {
        this.infoContainerId(0);
        this.infoContainerId(id);
        this.isInfoModalOpen(false);
        this.isInfoModalOpen(true);
    }

    refreshStats() {
        if (this.containerStatsId() === 0) return;
        $.get(`/containers/${this.containerStatsId()}/stats`)
            .then(stats => statsChart.load(stats));
    }

    getStats(id, name) {
        this.containerStatsName(name);
        this.containerStatsId(id);
        this.infoContainerId(id);
        this.refreshStats();
        setTimeout(() => {
            this.refreshStats();
            statsChart.updateMemory(0);
            statsChart.updateCpu(0);
        }, 200);
        this.isStatsModalOpen(false);
        this.isStatsModalOpen(true);
    }

    getAllContainerInfo() {
        var handler = (containers: any[]) => {
            containers.forEach(container => {
                var childContainer = this.getChild(container.Id);
                if (!childContainer) return;

                childContainer.item.containerInfo(container);
            });

            if (!this.isPolling()) return;
            window.containerPoller = setTimeout(() => { this.getAllContainerInfo(); }, 5000);
        }

        $.get("/hosts/containers")
            .done(handler)
            .fail(error => {
                toastr.error("Failed to retrieve container information")
                this.isPolling(false);
            });
    }

    getChild(dockerId: string) {
        var child = this.allItems().filter(container => {
            var isMatch = container.item.dockerId() === dockerId;
            return isMatch;
        });
        return child[0];
    }

    statsListener = (event: Concierge.Event) => {
        if (event.name !== this.containerStatsName()) return;
        if (!this.isStatsModalOpen()) return;

        var cpu = Number(event.event.cpu.replace("%", ""));
        var memory = Number(event.event.memory.replace("%", ""));
        statsChart.updateCpu(cpu);
        statsChart.updateMemory(memory);
    }
}
