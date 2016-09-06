import ko = require("knockout");
import ConciergeList = require("./list");
import ConciergeModel = require("./model");
export = component;

var listOptions = {
	createItem: () => new ConciergeModel(),
	url: "/concierges"
};

var component = {
	viewModel: {
		createViewModel: () => {
			var viewModel = new ConciergeList(listOptions);
			viewModel.loadFromServer();
			return viewModel;
		}
	},
	template: { require: "text!../components/concierges/view.html" }
}
