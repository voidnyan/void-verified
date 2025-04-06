import {DOM} from "../utils/DOM";
import {AnilistAPI} from "../api/anilistAPI";
import {Toaster} from "../utils/toaster";
import {Image} from "./components";
import {StaticSettings} from "../utils/staticSettings";
import {BaseSearchComponent} from "./baseSearchComponent";

export interface IMediaSearchResult {
	id: Number;
	title: { userPreferred: String };
	coverImage: { large: String };
	type: String;
	startDate: { year: Number };
	episodes?: Number | null;
	chapters?: Number | null;
}

export class MediaSearchComponent extends BaseSearchComponent {
	input: HTMLInputElement;
	private timeout;
	// this is actually read
	private allowMultiple: boolean;

	private keepOpen = false;

	onSelect: (value: IMediaSearchResult) => void;
	private scrollElement: HTMLElement;

	constructor(onSelect: (value: IMediaSearchResult) => void, allowMultiple = false) {
		super();
		this.onSelect = onSelect;
		this.allowMultiple = allowMultiple;
		this.input = DOM.create("input", "input");
		this.input.setAttribute("placeholder", "Search media...");
		this.input.addEventListener(
			"input",
			(event: InputEvent) => {
				const target = event.target as HTMLInputElement;
				this.handleSearchInput(target.value);
			},
		);
		this.input.addEventListener("focusout", () => {
			this.keepOpen = false;
			// set timeout so clicking on a result works
			setTimeout(() => {
				if (!this.keepOpen) {
					this.resultsContainer.replaceChildren();
					this.scrollElement.removeEventListener("scroll", this.updateResultsContainerLocation);
					window.removeEventListener("resize", this.updateResultsContainerLocation);
					this.resultsContainer.remove();
				}
			}, 150);
		});
		this.element.append(this.input);
	}

	private handleSearchInput(value: string) {
		clearTimeout(this.timeout);
		if (value === "" || value.length < 3) {
			return;
		}
		this.timeout = setTimeout(async () => {
			const anilistAPI = new AnilistAPI(StaticSettings.settingsInstance);
			try {
				Toaster.debug(`Querying media with search word ${value}`);
				const response = await anilistAPI.searchMedia(value);
				this.renderSearchResults(response);
			} catch (error) {
				Toaster.error(
					`Failed to query media with search word ${value}`,
					error
				);
			}
		}, 800);
	}

	renderSearchResults(results: IMediaSearchResult[]) {
		if (!document.body.contains(this.resultsContainer)) {
			document.body.append(this.resultsContainer);
		}
		this.resultsContainer.replaceChildren();
		this.scrollElement = this.addScrollListener(this.element, this.updateResultsContainerLocation);
		window.addEventListener("resize", this.updateResultsContainerLocation, {passive: true});
		for (const result of results) {
			const resultContainer = DOM.create("div", "search-result");

			resultContainer.addEventListener(
				"click",
				function (event) {
					event.stopPropagation();
					this.onSelect(result);
					if (!this.allowMultiple) {
						this.resultsContainer.replaceChildren();
					} else {
						this.input.focus();
						this.keepOpen = true;
					}
				}.bind(this),
			);

			resultContainer.append(
				DOM.create(
					"div",
					null,
					Image(result.coverImage.large, "media-search-poster"),
				),
			);
			const infoContainer = DOM.create("div", "media-search-info");
			infoContainer.append(
				DOM.create(
					"div",
					"media-search-title",
					result.title.userPreferred,
				),
			);
			infoContainer.append(
				DOM.create(
					"div",
					"media-search-type",
					`${result.type} ${result.startDate.year}`,
				),
			);
			resultContainer.append(infoContainer);
			this.resultsContainer.append(resultContainer);
		}
		this.updateResultsContainerLocation();
	}

}
