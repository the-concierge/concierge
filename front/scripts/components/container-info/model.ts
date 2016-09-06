import ko = require("knockout");
import moment = require("moment");
import $ = require("jquery");
var toastr = require("toastr");
export = ContainerInfoModel;

class ContainerInfoModel {
	constructor(params: any) {
		params.id.subscribe(id => {
			if (id === 0) return;
			this.getInfo(id);
		});
		
	}
	info = ko.observableArray<any>([]);

	getInfo(id: number) {
		$.get("/containers/" + id + "/info")
			.done(info => this.composeInfo(info))
			.fail(error => toastr.error(error));
	}

	composeInfo(info) {
		var states = [
			{ name: "Variant", value: info.Config.Image },
			{ name: "Running", value: info.State.Running, inverse: false },
			{ name: "Paused", value: info.State.Paused, inverse: true },
			{ name: "Dead", value: info.State.Dead, inverse: true },
			{ name: "Started", value: this.cleanTime(info.State.StartedAt) },
			{ name: "Finished", value: this.cleanTime(info.State.FinishedAt) },
			{ name: "Exit Code", value: info.State.ExitCode }
		]

		this.info(states);
	}

	cleanTime(time: string) {
		if (time.length === 0) return "No time specified";
		return moment(time).format("DD-MMM-YYYY HH:mm:ss");
	}

	labelClass(value: any) {
		if (typeof value === "boolean")
			return value
				? "label label-success"
				: "label label-danger";

		return "";
	}
}