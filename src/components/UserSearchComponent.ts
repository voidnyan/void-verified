import {DOM} from "../utils/DOM";
import {AnilistAPI} from "../api/anilistAPI";
import {Toaster} from "../utils/toaster";
import {Image} from "./components";
import {StaticSettings} from "../utils/staticSettings";
import {IUserSearchResult} from "../api/types/IUserSearchResult";
import {BaseSearchComponent} from "./baseSearchComponent";



export class UserSearchComponent extends BaseSearchComponent {
	input: HTMLInputElement;
	private timeout;

	onSelect: (value: IUserSearchResult) => void;

	constructor(onSelect: (value: IUserSearchResult) => void) {
		super();
		this.onSelect = onSelect;
		this.input = DOM.create("input", "input");
		this.input.setAttribute("placeholder", "Search user...");
		this.input.addEventListener(
			"input",
			(event: InputEvent) => {
				const target = event.target as HTMLInputElement;
				this.handleSearchInput(target.value);
			},
		);
		this.input.addEventListener("focusout", () => {
			// set timeout so clicking on a result works
			setTimeout(() => {
				this.resultsContainer.replaceChildren();
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
				Toaster.debug(`Querying user with search word ${value}`);
				const response = await anilistAPI.searchUsers(value);
				this.renderSearchResults(response);
			} catch (error) {
				console.error(error);
				Toaster.error(
					`Failed to query media with search word ${value}`,
				);
			}
		}, 800);
	}

	renderSearchResults(results: IUserSearchResult[]) {
		this.resultsContainer.replaceChildren();
		for (const result of results) {
			const resultContainer = DOM.create("div", "search-result");

			resultContainer.addEventListener(
				"click",
				function () {
					this.onSelect(result);
					this.resultsContainer.replaceChildren();
				}.bind(this),
			);

			resultContainer.append(
				DOM.create(
					"div",
					null,
					Image(result.avatar.large, "user-search-avatar"),
				),
			);
			const name = DOM.create("div", "user-search-name", result.name);
			resultContainer.append(name);
			this.resultsContainer.append(resultContainer);
		}
		this.updateResultsContainerLocation();
	}

}
