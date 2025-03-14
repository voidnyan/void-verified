import {DOM} from "../utils/DOM";
import {DomAwareComponent} from "./domAwareComponent";

export class BaseSearchComponent extends DomAwareComponent {
	element: HTMLDivElement
	resultsContainer: HTMLDivElement;
	constructor() {
		super();
		this.element = DOM.create("div", "search-container");
		this.resultsContainer = DOM.create("div", "search-results");
		document.body.append(this.resultsContainer);
		this.onDomLoad(this.element, () => {
			this.attachScrollListener()
		});
		this.onDomUnload(this.element, () => {
			this.resultsContainer.remove();
		});
	}

	updateResultsContainerLocation() {
		const elementRect = this.element.getBoundingClientRect();
		this.resultsContainer.style.top = `${elementRect.bottom + window.scrollY}px`;
		this.resultsContainer.style.left = `${elementRect.left + window.scrollX}px`;
		this.resultsContainer.style.width = `${elementRect.width}px`;
	}

	private attachScrollListener() {
		const scrollContainer = this.findScrollableParent(this.element) || window;
		scrollContainer.addEventListener("scroll", () => {
			this.updateResultsContainerLocation();
		}, { passive: true });
	}

	private findScrollableParent(el: HTMLElement): HTMLElement | null {
		let parent: HTMLElement | null = el.parentElement;
		while (parent) {
			const style = getComputedStyle(parent);
			const overflowY = style.overflowY;
			if (overflowY === "auto" || overflowY === "scroll") {
				return parent;
			}
			parent = parent.parentElement;
		}
		return null;
	}
}
