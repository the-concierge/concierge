import ko = require("knockout");
import ContainerList = require("./list");
import ContainerModel = require("./model");
export = component;

var listOptions = {
	createItem: () => new ContainerModel(),
	url: "/containers"
};

var component = {
	viewModel: {
		createViewModel: () => {
			var viewModel = new ContainerList(listOptions);
			viewModel.loadFromServer();
			return viewModel;
		}
	},
	template: { require: "text!../components/containers/view.html" }
}
