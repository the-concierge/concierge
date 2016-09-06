import ko = require("knockout");
import ListEx = require("../lists/listEx");
import ArchiveModel = require("./model");
export = ArchiveList;

class ArchiveList extends ListEx<ArchiveModel> {
    constructor(options: Lists.ListOptionsEx) {
        super(options);    
    }  
}
