import ko = require("knockout");
import ArchiveList = require("./list");
import ArchiveModel = require("./model");
export = component;

var listOptions = {
	createItem: () => new ArchiveModel(),
	url: "/archive"
};

var component = {
	viewModel: {
		createViewModel: () => {
			var viewModel = new ArchiveList(listOptions);
			viewModel.loadFromServer();
			return viewModel;
		}
	},
	template: { require: "text!../components/archive/view.html" }
}
