import {DOM} from "../utils/DOM";

export class CheckboxComponent {
	element: HTMLInputElement;
	constructor(checked: boolean, onChange?: (checked: boolean) => void) {
		this.element = DOM.create("input", "checkbox");
		this.element.setAttribute("type", "checkbox");
		this.element.checked = checked;

		if (onChange !== undefined) {
			this.element.addEventListener("change", (event) => {
				const target = event.target as HTMLInputElement;
				onChange(target.checked)
			});
		}
	}

	getValue(): boolean {
		return this.element.checked;
	}

	setValue(checked: boolean): void {
		this.element.checked = checked;
	}
}
