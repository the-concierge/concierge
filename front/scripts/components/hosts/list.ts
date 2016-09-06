import ListEx = require("../lists/listEx");
import HostModel = require("./model");
export = HostList;

class HostList extends ListEx<HostModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);
    }
}
