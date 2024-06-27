import {AnilistAPI} from "../api/anilistAPI";
import {Button, IconButton, Image, InputField, Label, Link, Option, Select} from "../components/components";
import {ISettings} from "../types/settings";
import {DOM} from "../utils/DOM";
import {Toaster} from "../utils/toaster";
import {FilmIcon} from "../assets/icons";

export interface IActivityPostHandler {
	render(): void;

	settings: ISettings;

	renderSearchResults(
		results: ISearchResult[],
		activityPostHandler: IActivityPostHandler,
	): void;

	setSelectedSearchResult(
		result: ISearchResult,
		activityPostHandler: IActivityPostHandler,
	): void;

	selectedSearchResult?: ISearchResult;
}

interface ISearchResult {
	id: Number;
	title: { userPreferred: String };
	coverImage: { large: String };
	type: String;
	startDate: { year: Number };
	episodes: Number | null;
	chapters: Number | null;
}

interface IMediaActivity {
	status: MediaStatus;
	progress: Number;
	maxProgress?: Number,
	mediaListId?: Number
}

enum MediaStatus {
	Current = "CURRENT",
	Planning = "PLANNING",
	Completed = "COMPLETED",
	Dropped = "DROPPED",
	Paused = "PAUSED",
	Repeating = "REPEATING",
}

export class ActivityPostHandler implements IActivityPostHandler {
	settings: ISettings;
	#timeout;
	selectedSearchResult?: ISearchResult;
	mediaActivity?: IMediaActivity;

	constructor(settings: ISettings) {
		this.settings = settings;
	}

	render() {
		if (!this.settings.options.replyActivityUpdate.getValue() || !this.settings.isAuthorized()) {
			return;
		}

		const activityEditContainer = document.querySelector(
			".home > .activity-feed-wrap > .activity-edit",
		);

		if (!activityEditContainer) {
			return;
		}

		if (DOM.get("activity-reply-controls-container")) {
			return;
		}

		const markdownInput = activityEditContainer.querySelector(":scope > .input");
		const markdownEditor = activityEditContainer.querySelector(".markdown-editor");

		if (!markdownEditor) {
			return;
		}

		if (!markdownEditor.querySelector(".void-activity-reply-toggle-button")) {
			markdownEditor.append(this.#createToggleButton())
		}

		if (!markdownInput) {
			return;
		}

		activityEditContainer.insertBefore(
			this.#createControls(),
			markdownInput,
		);

	}

	#createControls() {
		const container = DOM.create(
			"div",
			"activity-reply-controls-container",
		);
		container.append(this.#createHeader());
		container.append(DOM.create("div", "media-status-controls", DOM.create("div", "gif-keyboard-list-placeholder", "Select a media...")));

		container.setAttribute("closed", true);
		return container;
	}

	#createToggleButton() {
		const button = IconButton(FilmIcon(), () => {
			const container = document.querySelector(".void-activity-reply-controls-container");
			const currentValue = container.getAttribute("closed");
			container.setAttribute("closed", currentValue === "true" ? "false" : "true");
		}, "gif-button");
		button.setAttribute("title", "Reply to Activity");
		return button;
	}

	#createStatusAndProgressControl = () => {
		const container = document.querySelector(".void-media-status-controls");
		container.replaceChildren();

		container.append(
			Image(this.selectedSearchResult.coverImage.large, "status-poster"),
		);
		const progressContainer = DOM.create("div", "activity-reply-progress-container");

		const mediaTitleContainer = DOM.create("div");
		mediaTitleContainer.append(
			DOM.create(
				"div",
				"media-search-title",
				Link(this.selectedSearchResult.title.userPreferred,
					`https://anilist.co/${this.selectedSearchResult.type === "ANIME" ? "anime" : "manga"}/${this.selectedSearchResult.id}`,
					"_blank"),
			),
		);
		mediaTitleContainer.append(
			DOM.create(
				"div",
				"media-search-type",
				`${this.selectedSearchResult.startDate.year ?? "Unreleased"} ${this.selectedSearchResult.type}`,
			),
		);
		progressContainer.append(mediaTitleContainer);

		progressContainer.append(DOM.create("h5", "layout-header", "Status"));

		const options = Object.keys(MediaStatus)
			.filter(status => !(MediaStatus[status] === MediaStatus.Repeating && this.mediaActivity.maxProgress === 1))
			.map((status) =>
			Option(status, MediaStatus[status] === this.mediaActivity.status, () => {
				this.mediaActivity.status = MediaStatus[status];
				this.#createStatusAndProgressControl();
			}),
		);
		const select = Select(options);
		progressContainer.append(select);
		container.append(progressContainer);

		if (this.mediaActivity.status !== MediaStatus.Current && this.mediaActivity.status !== MediaStatus.Repeating) {
			return;
		}

		progressContainer.append(DOM.create("h5", "layout-header", "Progress"));
		const progressInput = InputField(this.mediaActivity.progress, (event) => {
			this.mediaActivity.progress = Number(event.target.value);
		});
		progressInput.setAttribute("type", "number");
		progressInput.setAttribute("max", this.mediaActivity.maxProgress);
		progressInput.setAttribute("min", 0);
		progressContainer.append(DOM.create("div", null, progressInput));
	};

	#createHeader() {
		const container = DOM.create("div", "activity-reply-search-container");
		const searchInput = DOM.create("input", "input");
		searchInput.setAttribute("placeholder", "Search media...");
		searchInput.addEventListener(
			"keyup",
			function (event) {
				this.#handleSearchInput(event.target.value);
			}.bind(this),
		);
		searchInput.addEventListener("focusout", () => {
			// set timeout so clicking on a result works
			setTimeout(() => {
				DOM.get("#media-search-list")?.remove();
			}, 150);
		});
		container.append(searchInput);

		const headerContainer = DOM.create("div", "activity-reply-header", container);
		const replyButton = Button("Reply", function () {
			this.#handleReply();
		}.bind(this), "slim");
		headerContainer.append(replyButton);
		return headerContainer;
	}

	async #handleReply() {
		if (!this.selectedSearchResult) {
			Toaster.notify("Please search for a media before replying.")
			return;
		}
		if (this.#validateNotificationOptions()) {
			Toaster.notify(`You have disabled ${this.mediaActivity.status} list activity type. Enable it in settings to create this activity.`);
			return;
		}
		const anilistAPI = new AnilistAPI(this.settings);
		try {
			await anilistAPI.updateMediaProgress(this.mediaActivity.mediaListId, this.selectedSearchResult.id, this.mediaActivity.status, this.mediaActivity.progress);
		} catch (error) {
			Toaster.error("Failed to update media progress");
			console.error(error);
			return;
		}
		try {
			const response = await anilistAPI.getCreatedMediaActivity(this.selectedSearchResult.id);
			const textarea = document.querySelector(".home > .activity-feed-wrap > .activity-edit > .input > textarea") as HTMLInputElement;
			const replyResponse = await anilistAPI.replyToActivity(response.id, textarea.value);
			window.location.replace(
				`https://anilist.co/activity/${response.id}`,
			);
		} catch (error) {
			Toaster.error("Failed to reply to activity");
		}
	}

	#validateNotificationOptions(){
		const disabledListActivity: Array<{type: string, disabled: boolean}> = JSON.parse(localStorage.getItem("auth"))?.options?.disabledListActivity;
		return disabledListActivity.some(disabledListActivity => disabledListActivity.type === this.mediaActivity.status && disabledListActivity.disabled);
	}

	#handleSearchInput(value: string) {
		clearTimeout(this.#timeout);
		if (value === "" || value.length < 3) {
			return;
		}
		this.#timeout = setTimeout(async () => {
			const anilistAPI = new AnilistAPI(this.settings);
			try {
				Toaster.debug(`Querying media with search word ${value}`);
				const response = await anilistAPI.searchMedia(value);
				this.renderSearchResults(response);
			} catch (error) {
				console.error(error);
				Toaster.error(
					`Failed to query media with search word ${value}`,
				);
			}
		}, 800);
	}

	renderSearchResults(results: ISearchResult[]) {
		const container = DOM.getOrCreate("div", "#media-search-list");
		container.replaceChildren([]);
		for (const result of results) {
			const resultContainer = DOM.create("div", "media-search-result");

			resultContainer.addEventListener(
				"click",
				function () {
					this.setSelectedSearchResult(result);
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

			container.append(resultContainer);
		}

		DOM.get("activity-reply-search-container").append(container);
	}

	async setSelectedSearchResult(result: ISearchResult) {
		this.selectedSearchResult = result;
		DOM.get("#media-search-list")?.remove();
		const anilistAPI = new AnilistAPI(this.settings);
		try {
			const mediaProgress = await anilistAPI.getMediaProgress(result.id);
			if (mediaProgress) {
				this.mediaActivity = {
					status: mediaProgress.status,
					progress: mediaProgress.progress,
					maxProgress: mediaProgress.media.episodes ?? mediaProgress.media.chapters,
					mediaListId: mediaProgress.id
				};
			} else {
				this.mediaActivity = {
					status: MediaStatus.Planning,
					progress: 0,
					maxProgress: this.selectedSearchResult.episodes ?? this.selectedSearchResult.chapters,
					mediaListId: undefined
				}
			}

			this.#createStatusAndProgressControl();
		} catch (error) {
			Toaster.error("Failed to query media progress");
			console.error(error);
		}
	}
}
