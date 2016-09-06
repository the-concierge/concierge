import ko = require("knockout");
import socket = require("../../socket");
import $ = require("jquery");
import toastr = require("toastr");
export = ConciergeViewModel;

class ConciergeViewModel {
    constructor() {
        this.activeModel(this.availableModels()[0]);
        socket.on("event", this.eventHandler);
        socket.on("stats", this.statsHandler);
        this.initalise()
            .then(() => toastr.success("Initialised"));
    }

    availableModels: KnockoutObservableArray<Component> = ko.observableArray([
        { name: "Containers", model: "x-containers" },
        { name: "Variants", model: "x-variants" },
        { name: 'Applications', model: 'x-applications' },
        { name: "Hosts", model: "x-hosts" },
        { name: "Concierges", model: "x-concierges" },
        { name: "Configuration", model: "x-configurations" },
        { name: "Archive", model: "x-archive" },
    ]);

    activeModel = ko.observable<Component>();

    loadModel(model: Component) {
        clearTimeout(window.containerPoller);
        this.activeModel(model);
    }

    modelClass = model => {
        var isActive = this.activeModel().name === model.name;
        return isActive
            ? "btn btn-primary"
            : "btn btn.default";
    };

    entities = ko.observable<EntityList>({});
    logLengthLimit = ko.observable<number>(25);
    eventLogReverse = ko.observable<boolean>(false);
    isEventModalOpen = ko.observable<boolean>(false);

    eventEntities = ko.computed(() => {
        return Object.keys(this.entities());
    });

    setEntity(entity) {
        this.eventEntity(entity);
        entity.unread(0);
    }
    eventEntity = ko.observable<Concierge.EntityModel>({
        type: "--",
        name: "--",
        events: ko.observableArray([]),
        unread: ko.observable(0),
        cpu: ko.observable("--%"),
        memory: ko.observable("--%")
    });

    totalUnread = ko.computed(() => {
        var entities = this.entities();
        var unread = this.eventEntities().reduce((prev, curr) => {
            var entity = this.entities()[curr];
            return prev += entity.unread();
        }, 0);

        return unread > 99
            ? "99+"
            : unread.toString()
    });

    eventEntityLog: KnockoutComputed<string> = ko.computed(() => {

        var log = (this.eventEntity() || <any>{}).events || ko.observableArray([]);
        log = log();
        var limit = this.logLengthLimit() || 0;
        var trim = limit === 0 ? log.length : this.logLengthLimit();

        if (trim > 0) log = log.slice(-trim);
        log = this.eventLogReverse() ? log.reverse() : log;
        return log.join("\n");
    });

    emitCount = ko.computed(() => {
        var trim = this.logLengthLimit();
        trim = Number(trim || 0);
        if (trim === 0) return 0;
        var emitted = this.eventEntity().events().length - trim;
        if (emitted < 0) emitted = 0;
        return emitted;
    });
    emitText = ko.computed(() => {
        var emitted = this.emitCount();
        if (emitted === 0) return "";
        return `(${emitted} lines emitted)`;
    });


    entitiesByType(type: string) {
        var entities = this.entities();
        return Object.keys(entities)
            .filter(e => entities[e].type === type)
            .map(t => entities[t]);
    }

    entityTypes = ko.computed(() => {
        var entities = this.entities();
        return Object.keys(entities)
            .map(key => entities[key].type)
            .reduce((prev, curr) => {
                if (prev.indexOf(curr) === -1) prev.push(curr);
                return prev;
            }, [])

    });

    eventHandler = (event: Concierge.Event) => {
        if (!event || !event.event) return;
        var currEntity = this.eventEntity();
        var entities = this.entities();
        var entity = entities[event.name] || this.newEntity(event);

        entity.events.push(event.event.trim());

        // Entity unread counter doesn't increase if it is currently being viewed
        var isSameEntity = currEntity.name === entity.name && currEntity.type === entity.type;
        if (!isSameEntity) entity.unread(entity.unread() + 1);

        entities[event.name] = entity;
        this.entities(entities);
    }

    statsHandler = (event: Concierge.Event) => {
        var entities = this.entities();
        var entity = entities[event.name];
        if (!entity) return;
        entity.memory(event.event.memory);
        entity.cpu(event.event.cpu);

    }

    newEntity(event: Concierge.Event): Concierge.EntityModel {
        return {
            name: event.name,
            events: ko.observableArray([]),
            unread: ko.observable(0),
            type: event.type,
            memory: ko.observable("--%"),
            cpu: ko.observable("--%")
        }
    }

    initalise() {
        var toEntity = (container: Concierge.Container, log: string) => {
            var entity: Concierge.EntityModel = {
                type: "Container",
                events: ko.observableArray<string>(log.split("\n")),
                name: container.subdomain,
                unread: ko.observable(0),
                cpu: ko.observable(""),
                memory: ko.observable("")
            }
            var entities = this.entities();
            entities[container.subdomain.toString()] = entity;
            this.entities(entities);

        }
        var getLog = container => $.get(`/containers/${container.id}/log`)
            .then(log => toEntity(container, log));
        var getLogs = containers => containers.map(getLog);

        return $.get("/containers")
            .then(getLogs);
    }
}

interface Component {
    name: string;
    model: string;
}

interface EntityList {
    [index: string]: Concierge.EntityModel;
}
