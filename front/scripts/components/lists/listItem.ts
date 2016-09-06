import ko = require('knockout');
import _ = require('lodash');
import makeCommand = require('./makeCommand');
export = ListItemVM;


class ListItemVM<T extends Lists.ViewModel> implements Lists.ViewModel {

    constructor(public item: T, private isLocked: KnockoutObservable<boolean>, private moveTo: (index?: number) => void) {
        this.isLocked.subscribe(newValue => {
            if (newValue) this.isEditing(false);
        });
    }

    loadFromModel(model) {
        this.item.loadFromModel(model);
        this.isNew(false);
        this.isDeleted(model['__deleted'] || false);
        this.originalModel(this.item.saveToModel());
    }

    saveToModel(): any {
        return this.item.saveToModel();
    }

    originalModel = ko.observable(this.item.saveToModel());

    isNew = ko.observable(true);

    isDeleted = ko.observable(false);

    delete = makeCommand({
        execute: () => this.isDeleted(true),
        canExecute: () => !this.isLocked() && !this.isDeleted()
    });

    undelete = makeCommand({
        execute: () => this.isDeleted(false),
        canExecute: () => !this.isLocked() && this.isDeleted()
    });

    isDirty = ko.computed(() => {
        if (this.isNew()) return true;

        var orig = this.originalModel();
        if (!orig.hasOwnProperty('__deleted') && this.isDeleted()) return true;

        var curr = this.item.saveToModel();
        return !_.isEqual(orig, curr);
    });

    isSelected: KnockoutObservable<boolean> = ko.observable(false);

    select = makeCommand(() => this.isSelected(true));

    unselect = makeCommand(() => this.isSelected(false));

    isEditing: KnockoutObservable<boolean> = ko.observable(false);

    startEditing = makeCommand({
        execute: () => this.isEditing(true),
        canExecute: () => !this.isLocked() && !this.isEditing()
    });

    stopEditing = makeCommand({
        execute: () => this.isEditing(false),
        canExecute: () => this.isEditing()
    });

    undoEditing = makeCommand({
        execute: () => {
            if (this.isNew()) {
                this.moveTo(null); // remove from list.
            }
            else {
                this.loadFromModel(this.originalModel());
            }
            this.isEditing(false);
        },
        canExecute: () => this.isDirty()
    });
}
