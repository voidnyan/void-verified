import {DomAwareComponent} from "./domAwareComponent";
import {DOM} from "../utils/DOM";

interface IDropdownMenuOption {
	value: string,
	item: Node
}

export class DropdownMenuComponent extends DomAwareComponent {
	trigger: Element;
	menu: HTMLDivElement;
	constructor(options: string[] | IDropdownMenuOption[], trigger: Element, callback: (value: string) => void, initialValue?: string) {
		super();
		this.menu = DOM.create("div", "dropdown-menu");
		this.trigger = trigger;
		this.createMenu(options, callback, initialValue)
		this.trigger.addEventListener("click", () => {
			this.open();
		});

		this.onDomLoad(trigger, () => {
			document.body.append(this.menu);
		});

		this.onDomUnload(trigger, () => {
			this.menu.remove();
		});
	}

	private open() {
		this.menu.classList.add("void-visible");
		const triggerRect = this.trigger.getBoundingClientRect();
		const menuRect = this.menu.getBoundingClientRect();
		const padding = 5;
		this.menu.style.top = `${triggerRect.bottom + window.scrollY + padding}px`;
		this.menu.style.left = `${triggerRect.left + window.scrollX - menuRect.width + triggerRect.width}px`;

		const closeCall = (event) => {
			const menu = event.target.closest(".void-dropdown-menu");
			const t = event.target.closest([...this.trigger.classList].map(x => "." + x));
			if (menu !== this.menu && event.target !== this.trigger && t !== this.trigger) {
				this.close();
				document.removeEventListener("click", closeCall);
			}
		};

		document.addEventListener("click", closeCall);
	}

	private close() {
		this.menu.classList.remove("void-visible");
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
