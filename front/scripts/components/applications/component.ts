import ko = require("knockout");
import ApplicationList = require("./list");
import ApplicationModal = require("./model");
export = component;

var listOptions = {
	createItem: () => new ApplicationModal(),
	url: "/applications"
};

var component = {
	viewModel: {
		createViewModel: () => {
			var viewModel = new ApplicationList(listOptions);
			viewModel.loadFromServer();
			return viewModel;
		}
	},
	template: { require: "text!../components/applications/view.html" }
}
