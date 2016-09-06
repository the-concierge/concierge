import ko = require('knockout');
import _ = require('lodash');
export = impl;


var impl = <Lists.MakeCommand> ((options: any) => {

    var rawCmd = null;
    var rawCan = null;
    var proxyTarget = null;

    if (_.isFunction(options)) {
        rawCmd = options;
    }
    else if (_.isPlainObject(options) && options.execute) {
        rawCmd = options.execute;
        rawCan = options.canExecute;
    }
    else if (_.isPlainObject(options) && options.hasOwnProperty('proxyFor')) {
        proxyTarget = ko.observable<Lists.Command<any>>(options.proxyFor);
        rawCmd = () => proxyTarget()();
        rawCan = () => proxyTarget() ? proxyTarget().canExecute() : false;
    }

    if (!rawCmd) throw new Error("makeCommand: invalid options object");
    if (!rawCan) rawCan = () => true;

    var command = rawCmd;
    command.execute = rawCmd;
    command.canExecute = ko.computed<boolean>(rawCan);
    command.tryExecute = () => rawCan() ? rawCmd() : void 0;
    if (proxyTarget) command.target = proxyTarget;
    return command;
});
