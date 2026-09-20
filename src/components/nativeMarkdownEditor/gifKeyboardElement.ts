import {Toaster} from "../../utils/toaster";
import {DOM} from "../../utils/DOM";
import {ActionInputField, GifItem, GifKeyboard, Pagination, RangeField, Select, Option} from "../components";
import {GifKeyboardHandler} from "../../handlers/gifKeyboardHandler";
import {AddIcon} from "../../assets/icons";
import {ImageFormats} from "../../assets/imageFormats";

const keyboardTabs = {
	gifs: "GIFS",
	images: "Images",
};

export class GifKeyboardElement {
	private activeTab = keyboardTabs.gifs;
	private paginationPage = 0;
	private readonly pageSize = 30;
	private readonly markdownEditor = HTMLDivElement;
	element: HTMLDivElement;
	constructor(markdownEditor: HTMLDivElement) {
		// @ts-ignore
		this.markdownEditor = markdownEditor;
		this.element = GifKeyboard(this.createKeyboardHeader()) as HTMLDivElement;
		this.renderMediaList();
		this.renderControls();
	}


	private createKeyboardHeader() {
		const header = DOM.create("div", "gif-keyboard-header");

		const options = Object.values(keyboardTabs).map((option) =>
			Option(option, option === this.activeTab, (event) => {
				this.activeTab = option;
				this.paginationPage = 0;
				this.refreshKeyboard();
				event.target.parentElement.parentElement.replaceWith(
					this.createKeyboardHeader(),
				);
			}),
		);
		header.append(Select(options));

		header.append(
			RangeField(
				GifKeyboardHandler.config.gifSize,
				(event) => {
					GifKeyboardHandler.config.gifSize = event.target.value;
					GifKeyboardHandler.config.save();
				},
				600,
				10,
				10,
			),
		);
		return header;
	};


	private renderMediaList() {
		if (!this.element || !this.markdownEditor) {
			return;
		}
		const mediaItems = this.element.querySelector(".void-gif-keyboard-list");
		const columns = [1, 2, 3].map(() => {
			return DOM.create("div", "gif-keyboard-list-column");
		});
		mediaItems.replaceChildren(...columns);
		// @ts-ignore
		const textarea = this.markdownEditor.parentElement.querySelector("textarea");
		const mediaList =
			this.activeTab === keyboardTabs.gifs
				? GifKeyboardHandler.config.gifs
				: GifKeyboardHandler.config.images;
		if (mediaList.length === 0) {
			mediaItems.replaceChildren(
				DOM.create(
					"div",
					"gif-keyboard-list-placeholder",
					this.activeTab === keyboardTabs.gifs
						? "It's pronounced GIF."
						: "You have no funny memes :c",
				),
			);
		}
		for (const [index, media] of mediaList
			.slice(
				this.paginationPage * this.pageSize,
				this.paginationPage * this.pageSize + this.pageSize,
			)
			.entries()) {
			mediaItems.children.item(index % 3).append(
				GifItem(
					media,
					() => {
						textarea.setRangeText(
							`img${GifKeyboardHandler.config.gifSize}(${media})`,
						);
						textarea.dispatchEvent(new Event('input', {bubbles: true}));
					},
					() => {
						GifKeyboardHandler.addOrRemoveMedia(media, this.activeTab);
						GifKeyboardHandler.config.save();
					},
					mediaList,
				),
			);
		}
	}

	private renderControls() {
		const container = this.element.querySelector(
			".void-gif-keyboard-top-controls",
		);
		const mediaField = this.createMediaAddField(this.element);
		const pagination = this.createPagination();
		container.replaceChildren(mediaField, pagination);

		const bottomContainer = this.element.querySelector(".void-gif-keyboard-bottom-controls");
		const bottomPagination = this.createPagination();
		bottomContainer.replaceChildren(bottomPagination);
	}

	private createMediaAddField(keyboard) {
		const actionfield = ActionInputField(
			"",
			(_, inputField) => {
				this.handleAddMediaField(inputField, keyboard);
			},
			AddIcon(),
		);
		actionfield
			.querySelector("input")
			.setAttribute("placeholder", "Add media...");

		return actionfield;
	}

	private handleAddMediaField(inputField, keyboard) {
		const url = inputField.value;
		inputField.value = "";

		let format;
		if (url.toLowerCase().endsWith(".gif")) {
			format = keyboardTabs.gifs;
		} else if (
			ImageFormats.some((imgFormat) =>
				url.toLowerCase().endsWith(imgFormat.toLocaleLowerCase()),
			)
		) {
			format = keyboardTabs.images;
		}
		if (!format) {
			Toaster.error("Url was not recognized as image or GIF.");
			return;
		}

		Toaster.success(`Added media to ${format}`);
		GifKeyboardHandler.addOrRemoveMedia(url, format);
		GifKeyboardHandler.config.save();
		this.refreshKeyboard();
	}

	private createPagination() {
		const container = DOM.create(
			"div",
			"gif-keyboard-pagination-container",
		);
		const mediaList =
			this.activeTab === keyboardTabs.gifs
				? GifKeyboardHandler.config.gifs
				: GifKeyboardHandler.config.images;
		const maxPages = Math.ceil(mediaList.length / this.pageSize) - 1;

		if (this.paginationPage > maxPages) {
			this.paginationPage = maxPages;
		}

		container.append(
			Pagination(this.paginationPage, maxPages, (page) => {
				this.paginationPage = page;
				this.refreshKeyboard();
			}),
		);
		return container;
	}

	private refreshKeyboard() {
		this.renderControls();
		this.renderMediaList();
	}
}
