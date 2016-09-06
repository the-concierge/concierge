declare module Lists {

    export interface Command<TReturn> {
        (): TReturn;
        execute: () => TReturn;
        canExecute: () => boolean;
        tryExecute: () => TReturn;
    }

    export interface ViewModel {
        loadFromModel(model: any): void;
        saveToModel(): any;

        isNew?: KnockoutObservable<boolean>;
        isDeleted?: KnockoutObservable<boolean>;
        isDirty?: KnockoutObservable<boolean>;
        isSelected?: KnockoutObservable<boolean>;
        isEditing?: KnockoutObservable<boolean>;


        delete?: Command<any>;
        undeleted?: Command<any>;

        select?: Command<any>;
        unselect?: Command<any>;
        
        startEditing?: Command<any>;
        stopEditing?: Command<any>;
        undoEditing?: Command<any>;
    }

    export interface ListOptions {
        createItem: () => ViewModel;
        url: string;
    }

    export interface ListOptionsEx extends ListOptions {
    }

    export interface ProxyCommand<TReturn> extends Command<TReturn> {
        target: KnockoutObservable<Command<TReturn>>;
    }

    export interface MakeCommand {
        <TReturn>(options: ExecuteFunction<TReturn> | ExecuteOptions<TReturn>): Command<TReturn>;
        <TReturn>(options: ProxyOptions<TReturn>): ProxyCommand<TReturn>;
    }

    export interface ExecuteFunction<TReturn> {
        (): TReturn;
    }

    export interface ProxyOptions<TReturn> {
        proxyFor: Command<TReturn>;
    }

    export interface ExecuteOptions<TReturn> {
        execute: () => TReturn;
        canExecute?: () => boolean;
    }

    export interface SaveRequest {
        updates: any[];
        inserts: any[];
        deletes: any[];
    }
}
