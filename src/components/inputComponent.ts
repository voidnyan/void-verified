import {DOM} from "../utils/DOM";
import {transformClasses} from "./components";

export class InputComponent {
	element: HTMLInputElement;
	constructor(classes?: string, placeholder?: string) {
		this.element = DOM.create("input", transformClasses("input", classes));
		if (placeholder) {
			this.element.setAttribute("placeholder", placeholder);
		}
	}

	setType(type: "text" | "number" | "date" | "datetime-local") {
		this.element.setAttribute("type", type);
	}

	addChangeListener(callback: (event) => void) {
		this.element.addEventListener("change", callback);
	}

	setValue(value: string) {
		this.element.value = value;
	}

	getValue(): string {
		return this.element.value;
	}
}
