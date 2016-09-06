import ko = require("knockout");
import List = require("./list");
import Model = require("./model");
export = component;

var listOptions = {
	createItem: () => new Model(),
	url: "/variants"
};

var component = {
	viewModel: {
		createViewModel: () => {
			var viewModel = new List(listOptions);
			viewModel.loadFromServer();
			return viewModel;
		}
	},
	template: { require: "text!../components/variants/view.html" }
}
