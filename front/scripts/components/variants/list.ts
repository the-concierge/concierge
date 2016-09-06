import ko = require("knockout");
import $ = require("jquery");
import makeCommand = require("../lists/makeCommand");
import ListEx = require("../lists/listEx");
import VariantModel = require("./model");
import moment = require("moment");
import toastr = require("toastr");
export = VariantList;

toastr.options = {
    showDuration: 300,
    hideDuration: 300,
    timeOut: 3000
}

class VariantList extends ListEx<VariantModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);
    }

    variants = ko.observable([]);

    canBeDeleted(listItem, variant) {
        var isDeletable = !listItem.isDeleted() && variant.buildState().toString() !== "Deleted";
        return isDeletable;
    }

    canBeUndeleted(listItem) {
        listItem.isDeleted() === true;
    }

    delete(listItem, variant) {
        listItem.isDeleted(true);
        variant.buildState("Deleted");
    }

    undelete(listItem, variant) {
        listItem.isDeleted(false);
        variant.buildState(listItem.originalModel.buildState);
    }

    toDateString(time: number) {
        return moment(time).format("YYYY-MMM-DD HH:mm:ss");
    }

    deleteVariant = (variant: VariantModel) => {
        var name = variant.name();
        $.ajax({
            method: "DELETE",
            url: `/variants/${name}`,
        })
        .done(() => {
            this.loadFromServer();
            toastr.success(`Successfully deleted variant '${name}'`);
        })
        .fail(err => {
            toastr.error(`Failed to delete variant '${name}': ${err}`);
        });
        
    }
}
