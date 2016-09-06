import ko = require("knockout");
import TagList = require("./list");
export = component;

var component = {
	viewModel: TagList,
	template: { require: "text!../components/tags/view.html" }
}
