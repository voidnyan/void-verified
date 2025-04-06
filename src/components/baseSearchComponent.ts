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
		this.updateResultsContainerLocation = this.updateResultsContainerLocation.bind(this);
		this.onDomUnload(this.element, () => {
			this.resultsContainer.remove();
		});
	}

	updateResultsContainerLocation() {
		if (!document.body.contains(this.resultsContainer)) {
			document.body.append(this.resultsContainer);
		}
		const elementRect = this.element.getBoundingClientRect();
		this.resultsContainer.style.top = `${elementRect.bottom + window.scrollY}px`;
		this.resultsContainer.style.left = `${elementRect.left + window.scrollX}px`;
		this.resultsContainer.style.width = `${elementRect.width}px`;
	}
}
