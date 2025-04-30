import {DOM} from "./DOM";

const distance = 5;

export class ClassWithTooltip {
	static tooltip: HTMLDivElement;

	static initializeTooltip(): void {
		this.tooltip = DOM.create("div", "static-tooltip");
		document.body.append(this.tooltip);
	}

	static showTooltip(trigger: any, content: any, isInteractable = false) {
		this.tooltip.replaceChildren(content);
		const triggerRect = trigger instanceof DOMRect ? trigger : trigger.getBoundingClientRect();
		const tooltipRect = this.tooltip.getBoundingClientRect();
		this.tooltip.style.top = `${triggerRect.top + window.scrollY - tooltipRect.height - distance}px`;
		this.tooltip.style.left = `${triggerRect.left + window.scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`;
		this.tooltip.classList.add("void-visible");
		if (isInteractable) {
			this.tooltip.classList.add("void-interactable");
		} else {
			this.tooltip.classList.remove("void-interactable");
		}
	}

	static replaceTooltipContent(content: any, trigger?: any) {
		this.tooltip.replaceChildren(content);
		const triggerRect = trigger instanceof DOMRect ? trigger : trigger.getBoundingClientRect();
		const tooltipRect = this.tooltip.getBoundingClientRect();
		this.tooltip.style.top = `${triggerRect.top + window.scrollY - tooltipRect.height - distance}px`;
		this.tooltip.style.left = `${triggerRect.left + window.scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`;
	}

	static hideTooltip () {
		this.tooltip.classList.remove("void-visible");
	}
}

export class StaticTooltip extends ClassWithTooltip {
	private static isVisible = false;
	static initialize() {
		this.initializeTooltip();
		this.hide = this.hide.bind(this);
		this.tooltip.addEventListener("mouseover", () => {
			this.isVisible = true;
		});
		this.tooltip.addEventListener("mouseout", () => {
			this.hide();
		});
	}
	static register(trigger: HTMLElement | ChildNode, content: any, isInteractable = false) {
		trigger.addEventListener("mouseover", () => {
			this.show(trigger, content, isInteractable);
		});
		trigger.addEventListener("mouseout", () => {
			this.hide();
		});
	}

	static show(trigger: any, content: any, isInteractable = false) {
		this.isVisible = true;
		this.showTooltip(trigger, content, isInteractable);
	}

	static hide() {
		this.isVisible = false;
		setTimeout(() => {
			if (!this.isVisible) {
				this.hideTooltip();
				this.tooltip.removeEventListener("mouseout", this.hide);
			}
		}, this.tooltip.classList.contains("void-interactable") ? 300 : 0);
	}
}
