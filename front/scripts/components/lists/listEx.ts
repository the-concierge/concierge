import ko = require('knockout');
import _ = require('lodash');
import ListVM = require('./list');
import makeCommand = require('./makeCommand');
import toastr = require("toastr");
export = ListExVM;


class ListExVM<T extends Lists.ViewModel> extends ListVM<T> {

	constructor(public options: Lists.ListOptions) {
        super(options);
	}

    saveAll = makeCommand({
        execute: () => this.write(),
        canExecute: () => this.dirtyItems().length > 0
    });

    discardAll = makeCommand({
        execute: () => {
            // Avoid modifying the list that is being iterated over by making a copy.
            var allItems = [].concat(this.allItems());
            allItems.forEach(item => item.undoEditing.tryExecute());
        },
        canExecute: () => this.dirtyItems().length > 0
    });

    editSelected = makeCommand({
        execute: () => this.selectedItems().forEach(s => s.startEditing.tryExecute()),
        canExecute: () => !this.isLocked() && this.selectedItems().length > 0
    });

    uneditSelected = makeCommand({
        execute: () => this.selectedItems().forEach(s => s.stopEditing.tryExecute()),
        canExecute: () => this.selectedItems().length > 0
    });

	read() {
        this.loadFromServer();
	}

    write() {
        var changes = {
            inserts: [],
            updates: [],
            deletes: []
        };

        this.allItems().forEach(item => {
            var itemModel = item.saveToModel();
            if (item.isDeleted()) {
                if (item.isNew()) {
                    // No-op - this item was never on the serer.
                }
                else if (itemModel.hasOwnProperty('__deleted')) {
                    // Use 'mark as deleted' semantics.
                    changes.updates.push(itemModel);
                }
                else {
                    // Use 'hard delete' semantics.
                    changes.deletes.push(itemModel.id);
                }
            }
            else if (item.isNew()) {
                changes.inserts.push(itemModel);

            }
            else if (item.isDirty()) {
                changes.updates.push(itemModel);
            }
        });

		$.ajax({
            dataType: 'json',
            contentType: 'application/json',
            url: this.options.url,
			method: "POST",
            data: JSON.stringify(changes)
		})
        .done(() => {
            this.loadFromServer();
        })
        .fail((jqxhr: JQueryXHR) => {
            toastr.error(`An error occurred: \n\n${jqxhr.statusText}`);     
        });
    }

}
