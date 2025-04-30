import {DomAwareComponent} from "./domAwareComponent";
import {DOM} from "../utils/DOM";
import {DropdownDirection, PopOverComponentBase} from "./popOverComponent";

export interface IDropdownMenuOption {
	value: string,
	item: Node
}

export class DropdownMenuComponent extends PopOverComponentBase {
	constructor(
		options: string[] | IDropdownMenuOption[],
				trigger: HTMLElement,
		callback: (value: string | IDropdownMenuOption) => void,
		initialValue?: string,
		direction = DropdownDirection.bottomLeft
	) {
		super(trigger, direction);
		this.createMenu(options, callback, initialValue);


	}

	private createMenu(options: string[] | IDropdownMenuOption[], callback: (value: string | IDropdownMenuOption) => void, initialValue?: string) {
		for (const option of options) {
			let item;
			if (typeof option === "string") {
				item = DOM.create("div", "dropdown-menu-item");
				item.append(option);
				if (option === initialValue) {
					item.classList.add("void-active");
				}
			} else {
				item = option.item;
				item.classList.add("void-dropdown-menu-item");
				if (option.value === initialValue) {
					item.classList.add("void-active");
				}
			}
			item.addEventListener("click", () => {
				if (initialValue) {
					this.menu.querySelector(".void-active")?.classList.remove("void-active");
					item.classList.add("void-active");
				}
				callback(option);
				this.close();
			});
			this.menu.append(item);
		}
	}
}
