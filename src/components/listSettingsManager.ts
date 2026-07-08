import {IViewer} from "../api/types/IViewer";
import {DOM} from "../utils/DOM";

export class ListSettingsManager {
	element: HTMLDivElement;
	private viewer: IViewer;

	constructor(viewer: IViewer) {
		this.viewer = {...viewer};

		this.element = DOM.createDiv();
		this.createMergeTimeSelect();
	}

	private createMergeTimeSelect() {
		const wrapper = DOM.createDiv();
		const label = DOM.createDiv(null, "Activity Merge Time");
		const dropdown = DOM.create<HTMLSelectElement>("select");
		const option = DOM.create<HTMLOptionElement>("option", null, this.viewer.options.activityMergeTime, {value: this.viewer.options.activityMergeTime});
		dropdown.append(option);

		wrapper.append(label, dropdown);
		this.element.append(wrapper);
	}
}
