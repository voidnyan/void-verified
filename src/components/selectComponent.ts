import {DOM} from "../utils/DOM";

export class SelectComponent {
	element: HTMLDivElement;
	activeValue: string | number;
	constructor(initialValue: string | number, values: string[] | number[], onClick: (value: string | number) => void) {
		this.element = DOM.create("div", "select");
		this.activeValue = initialValue;
		for (const value of values) {
			const option = DOM.create("div", "option", value);
			option.setAttribute("value", value.toString());
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

	updateActive(value: string | number) {
		this.activeValue = value;
		this.element.querySelector(".active")?.classList.remove("active");
		this.element.querySelector(`.void-option[value="${this.activeValue}"]`)?.classList.add("active");
	}
}
