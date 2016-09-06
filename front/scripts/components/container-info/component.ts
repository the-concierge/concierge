import Model = require("./model");
export = component;

var component = {
	viewModel: Model,
	template: {
		require: "text!../components/container-info/view.html"
	}
};