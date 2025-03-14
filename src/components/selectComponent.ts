import {DOM} from "../utils/DOM";

export class SelectComponent {
	element: HTMLDivElement;
	activeValue: string;
	constructor(initialValue: string, values: string[], onClick: (value: string) => void) {
		this.element = DOM.create("div", "select");
		this.activeValue = initialValue;
		for (const value of values) {
			const option = DOM.create("div", "option", value);
			option.setAttribute("value", value);
			option.addEventListener("click", () => {
				onClick(value);
				option.classList.remove("active");
				this.updateActive(value);
			});
			if (this.activeValue === value) {
				option.classList.add("active");
			}
			this.element.append(option);
		};
	}

	updateActive(value: string) {
		this.activeValue = value;
		this.element.querySelector(".active")?.classList.remove("active");
		this.element.querySelector(`.void-option[value="${this.activeValue}"]`)?.classList.add("active");
	}
}
