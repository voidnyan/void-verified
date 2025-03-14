import {DOM} from "./DOM";

export class StaticTooltip {
	private static tooltip: HTMLDivElement;
	static initialize(): void {
		this.tooltip = DOM.create("div", "static-tooltip");
		document.body.append(this.tooltip);
	}

	static register(trigger: HTMLElement, content: any) {
		trigger.addEventListener("mouseover", () => {
			this.show(trigger, content);
		});
		trigger.addEventListener("mouseout", () => {
			this.hide();
		});
	}

	static show(trigger: any,content: any) {
		this.tooltip.replaceChildren(content);
		const triggerRect = trigger.getBoundingClientRect();
		const tooltipRect = this.tooltip.getBoundingClientRect();
		const distance = 5;
		this.tooltip.style.top = `${triggerRect.top + window.scrollY - tooltipRect.height - distance}px`;
		this.tooltip.style.left = `${triggerRect.left + window.scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`;
		this.tooltip.classList.add("void-visible");
	}

	static hide () {
		this.tooltip.classList.remove("void-visible");
	}
}
