import {DomAwareComponent} from "./domAwareComponent";
import {DOM} from "../utils/DOM";

interface IDropdownMenuOption {
	value: string,
	item: Node
}

export class DropdownMenuComponent extends DomAwareComponent {
	trigger: HTMLElement;
	menu: HTMLDivElement;
	constructor(options: string[] | IDropdownMenuOption[], trigger: HTMLElement, callback: (value: string) => void, initialValue?: string) {
		super();
		this.menu = DOM.create("div", "dropdown-menu");
		this.trigger = trigger;
		this.createMenu(options, callback, initialValue)
		this.trigger.addEventListener("click", () => {
			this.open();
		});

		this.updateDropdownLocation = this.updateDropdownLocation.bind(this);

		this.onDomUnload(trigger, () => {
			this.menu.remove();
		});
	}

	private open() {
		if (!document.body.contains(this.menu)) {
			document.body.append(this.menu);
		}
		this.menu.classList.add("void-visible");

		this.updateDropdownLocation();
		const scrollElement = this.addScrollListener(this.trigger, this.updateDropdownLocation);

		window.addEventListener("resize", this.updateDropdownLocation);

		const closeCall = (event) => {
			const menu = event.target.closest(".void-dropdown-menu");
			const t = event.target.closest([...this.trigger.classList].map(x => "." + x));
			if (menu !== this.menu && event.target !== this.trigger && t !== this.trigger) {
				this.close();
				document.removeEventListener("click", closeCall);
				if (scrollElement) {
					scrollElement.removeEventListener("scroll", this.updateDropdownLocation);
				}
				window.removeEventListener("resize", this.updateDropdownLocation);
			}
		};

		document.addEventListener("click", closeCall);
	}

	private updateDropdownLocation() {
		const triggerRect = this.trigger.getBoundingClientRect();
		const menuRect = this.menu.getBoundingClientRect();
		const padding = 5;
		this.menu.style.top = `${triggerRect.bottom + window.scrollY + padding}px`;
		this.menu.style.left = `${triggerRect.left + window.scrollX - menuRect.width + triggerRect.width}px`;
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
