import containers = require("./components/containers/component");
import applications  = require('./components/applications/component');
import tags = require("./components/tags/component");
import variants = require("./components/variants/component");
import NavigationVM = require("./components/navigation/model");
import hosts = require("./components/hosts/component");
import containerInfo = require("./components/container-info/component");
import configurations = require("./components/configurations/component");
import archive = require("./components/archive/component");
import concierges = require("./components/concierges/component");


require(["css!/styles/toastr", "toastr"], (_, toastr) => {
    const err = toastr.error;
    toastr.error = (message: string) => {
        console.log(message);
        err(message);
    }
}); // Toastr
require(["css!/styles/c3.min"]) 
require(["./socket"]);

require(["knockout", "jquery", "bootstrap"], (ko, $) => {
    require("knockout-file-bindings");
    
    ko.components.register("x-variants", variants);
    ko.components.register("x-tags", tags);
    ko.components.register("x-containers", containers);
    ko.components.register("x-hosts", hosts);
    ko.components.register("x-container-info", containerInfo);
    ko.components.register("x-configurations", configurations);
    ko.components.register("x-archive", archive);
    ko.components.register("x-concierges", concierges);
    ko.components.register('x-applications', applications);

    // Create the 'showModal: boolean' view binding for bootstrap modals
    ko.bindingHandlers.showModal = {
        init: () => { },
        update: (element, valueAccessor) => {
            var value = valueAccessor();
            if (ko.utils.unwrapObservable(value)) {
                $(element).modal('show');
                $("input", element).focus();
            }

            else $(element).modal('hide')
        }
    };

    ko.applyBindings(new NavigationVM());
});
