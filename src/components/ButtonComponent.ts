import {DOM} from "../utils/DOM";

export class ButtonComponent {
	element: HTMLButtonElement;
	constructor(text: string, onClick: (event: Event) => void, classes?: string) {
		this.element = DOM.create("button", "button" + (classes ? ` ${classes}` : ""), text);
		this.element.addEventListener("click", onClick);
	}

	setText(text: string) {
		this.element.replaceChildren(text);
	}

	setIsDisabled(disabled: boolean) {
		if (disabled) {
			this.element.setAttribute("disabled", "true");
		} else {
			this.element.removeAttribute("disabled");
		}
	}
}
