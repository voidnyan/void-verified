import {DomAwareComponent} from "./domAwareComponent";
import {DOM} from "../utils/DOM";

export enum DropdownDirection {
	top,
	bottomLeft
}

export class PopOverComponentBase extends DomAwareComponent {
	trigger: HTMLElement;
	menu: HTMLDivElement;
	private readonly direction: DropdownDirection;

	constructor(trigger: HTMLElement, direction: DropdownDirection) {
		super();
		this.menu = DOM.create("div", "dropdown-menu");
		this.direction = direction;
		this.trigger = trigger;
		this.trigger.classList.add("void-popover-trigger");
		this.trigger.addEventListener("click", () => {
			this.open();
		});

		this.updateDropdownLocation = this.updateDropdownLocation.bind(this);

		this.onDomUnload(trigger, () => {
			this.menu.remove();
		});
	}

	open() {
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

	updateDropdownLocation() {
		const triggerRect = this.trigger.getBoundingClientRect();
		const menuRect = this.menu.getBoundingClientRect();
		const padding = 5;
		if (this.direction === undefined || this.direction === DropdownDirection.bottomLeft) {
			this.menu.style.top = `${triggerRect.bottom + window.scrollY + padding}px`;
			this.menu.style.left = `${triggerRect.left + window.scrollX - menuRect.width + triggerRect.width}px`;
		} else if (this.direction === DropdownDirection.top) {
			if (triggerRect.top - window.scrollY -menuRect.height - padding <= 80) {
				this.menu.style.top = `${triggerRect.bottom + window.scrollY + padding}px`;
				this.menu.classList.add("top");
				this.menu.classList.remove("bottom");
			} else {
				this.menu.classList.remove("top");
				this.menu.classList.add("bottom");
				this.menu.style.top = `${triggerRect.top + window.scrollY - menuRect.height - padding}px`;
			}
			this.menu.style.left = `${triggerRect.left + window.scrollX - (menuRect.width / 2) + (triggerRect.width / 2)}px`;
		}
	}

	close() {
		this.menu.classList.remove("void-visible");
	}
}

export class PopOverComponent extends PopOverComponentBase {
	constructor(
		trigger: HTMLElement,
		content: HTMLElement | string,
		props: {
			direction?: DropdownDirection
		}) {
		super(trigger, props.direction);

		if (typeof content === "string") {
			this.menu.append(DOM.createDiv("popover-content", content));
		} else {
			content.classList.add("void-popover-content");
			this.menu.append(content);
		}
	}
}
