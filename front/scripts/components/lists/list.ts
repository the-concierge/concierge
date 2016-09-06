import ko = require('knockout');
import _ = require('lodash');
import ListItemVM = require('./listItem');
import makeCommand = require('./makeCommand');
var toastr = require("toastr");
export = ListVM;


class ListVM<T extends Lists.ViewModel> implements Lists.ViewModel {

    constructor(public options: Lists.ListOptions) { 
    }

    loadFromModel(listModel: any[]) {
        var listItemVMs = listModel.map(itemModel => {
            var itemVM = <T> this.options.createItem();
            var moveTo = toIndex => {
                var fromIndex = _.findIndex(this.allItems(), item => item === listItemVM);
                this.moveItem(fromIndex, toIndex);
            };
            var listItemVM = new ListItemVM<T>(itemVM, this.isLocked, moveTo);
            listItemVM.loadFromModel(itemModel);
            return listItemVM;
        });
        this.allItems(listItemVMs);
    }

    saveToModel() {
        var listModel = this.allItems().map(listItemVM => listItemVM.saveToModel());
        return listModel;
    }

    loadFromServer() {
        // Construct the URL
        var url = this.options.url;

        // Request the data from the server.
        $.ajax({
            method: "GET",
            url: url
        }).done((listModel, status, xhr) => {
            this.loadFromModel(listModel);
        }).fail(err => {
            toastr.error('Failed to load from server'); // TODO: handle this properly...
        });
    }

    allItems = ko.observableArray<ListItemVM<T>>([]);

    newItems = ko.computed(() => this.allItems().filter(item => item.isNew()));

    deletedItems = ko.computed(() => this.allItems().filter(item => item.isDeleted()));

    dirtyItems = ko.computed(() => this.allItems().filter(item => item.isDirty()));

    isLocked = ko.observable(false);

    lock = makeCommand({
        execute: () => this.isLocked(true),
        canExecute: () => !this.isLocked() && this.dirtyItems().length === 0
    });

    unlock = makeCommand({
        execute: () => this.isLocked(false),
        canExecute: () => this.isLocked()
    });

    createItem = makeCommand({
        execute: () => {
            var itemVM = <T> this.options.createItem();
            var moveTo = toIndex => {
                var fromIndex = _.findIndex(this.allItems(), item => item === listItemVM);
                this.moveItem(fromIndex, toIndex);
            };
            var listItemVM = new ListItemVM<T>(itemVM, this.isLocked, moveTo);
            listItemVM.startEditing.execute();
            this.allItems.unshift(listItemVM);
        },
        canExecute: () => !this.isLocked() && !!this.options.createItem
    });

    selectedItems: KnockoutComputed<ListItemVM<T>[]> = ko.computed(() => {
        return this.allItems().filter(item => item.isSelected());
    });

    isAllSelected = ko.pureComputed<boolean>({
        read: () => this.selectedItems().length === this.allItems().length,
        write: (value) => {
            value ? this.selectAll.tryExecute() : this.selectNone.tryExecute();
        }
    });

    selectAll = makeCommand(() => this.allItems().forEach(item => item.isSelected(true)));

    selectNone = makeCommand(() => this.allItems().forEach(item => item.isSelected(false)));

    private moveItem(fromIndex: number, toIndex: number = null) {
        if (fromIndex < 0 || fromIndex >= this.allItems().length) throw new Error('moveItem: fromIndex is out of range');
        var item = this.allItems()[fromIndex];
        if (toIndex === null) {
            // Remove item from list.
            this.allItems.remove(item);
        }
        else if (toIndex <= 0) {
            // TODO: Move item to start of list.
            throw new Error('Not implemented');
        }
        else if (toIndex >= this.allItems().length) {
            // TODO: Move item to end of list.
            throw new Error('Not implemented');
        }
        else {
            // TODO: Move item to new index.
            throw new Error('Not implemented');
        }
    }
}
