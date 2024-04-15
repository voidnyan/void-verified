import { AddIcon, GifIcon } from "../assets/icons";
import { ImageFormats } from "../assets/imageFormats";
import {
	ActionInputField,
	GifContainer,
	GifItem,
	GifKeyboard,
	IconButton,
	Option,
	Pagination,
	RangeField,
	Select,
} from "../components/components";
import { DOM } from "../utils/DOM";
import { Toaster } from "../utils/toaster";

const keyboardTabs = {
	gifs: "GIFS",
	images: "Images",
};

class GifKeyboardConfig {
	gifs;
	gifSize;
	images;
	#configInLocalStorage = "void-verified-gif-keyboard";
	constructor() {
		const config = JSON.parse(
			localStorage.getItem(this.#configInLocalStorage),
		);
		this.gifs = config?.gifs ?? [];
		this.images = config?.images ?? [];
		this.gifSize = config?.gifSize ?? 260;
	}

	save() {
		localStorage.setItem(
			"void-verified-gif-keyboard",
			JSON.stringify(this),
		);
	}
}

export class GifKeyboardHandler {
	#settings;
	#activeTab = keyboardTabs.gifs;
	#paginationPage = 0;
	#pageSize = 30;
	config;
	constructor(settings) {
		this.#settings = settings;
		this.config = new GifKeyboardConfig();
	}

	handleGifKeyboard() {
		this.#addGifKeyboards();
		this.#addMediaLikeButtons();
	}

	#addMediaLikeButtons() {
		if (!this.#settings.options.gifKeyboardEnabled.getValue()) {
			return;
		}

		if (!this.#settings.options.gifKeyboardLikeButtonsEnabled.getValue()) {
			return;
		}

		const gifs = document.querySelectorAll(
			":is(.activity-markdown, .reply-markdown) .markdown img[src$='.gif']",
		);
		for (const gif of gifs) {
			this.#addMediaLikeButton(gif, keyboardTabs.gifs, this.config.gifs);
		}

		const images = ImageFormats.map((format) => {
			return [
				...document.querySelectorAll(
					`:is(.activity-markdown, .reply-markdown) .markdown img[src$='.${format}']`,
				),
			];
		}).flat(1);
		for (const image of images) {
			this.#addMediaLikeButton(
				image,
				keyboardTabs.images,
				this.config.images,
			);
		}
	}

	#addMediaLikeButton(media, mediaType, mediaList) {
		if (media.parentElement.classList.contains("void-gif-like-container")) {
			return;
		}

		const img = media.cloneNode();
		img.removeAttribute("width");

		const gifContainer = GifContainer(
			img,
			() => {
				this.#addOrRemoveMedia(media.src, mediaType);
				this.config.save();
				this.#refreshKeyboards();
			},
			mediaList,
		);

		const width = media.getAttribute("width");
		if (width) {
			gifContainer.style.maxWidth = width?.endsWith("%")
				? width
				: `${width}px`;
		} else {
			gifContainer.style.maxWidth = `${img.width}px`;
		}

		media.replaceWith(gifContainer);
	}

	#addGifKeyboards() {
		if (!this.#settings.options.gifKeyboardEnabled.getValue()) {
			return;
		}

		const markdownEditors = document.querySelectorAll(".markdown-editor");
		for (const markdownEditor of markdownEditors) {
			if (markdownEditor.querySelector(".void-gif-button")) {
				continue;
			}

			const gifKeyboard = GifKeyboard(this.#createKeyboardHeader());

			gifKeyboard.classList.add("void-hidden");
			this.#renderMediaList(gifKeyboard, markdownEditor);
			this.#renderControls(gifKeyboard, markdownEditor);

			markdownEditor.append(
				IconButton(
					GifIcon(),
					() => {
						this.#toggleKeyboardVisibility(
							gifKeyboard,
							markdownEditor,
						);
					},
					"gif-button",
				),
			);

			markdownEditor.parentNode.insertBefore(
				gifKeyboard,
				markdownEditor.nextSibling,
			);
		}
	}

	#refreshKeyboards() {
		const keyboards = DOM.getAll("gif-keyboard-container");
		for (const keyboard of keyboards) {
			this.#refreshKeyboard(keyboard);
		}
	}

	#refreshKeyboard(keyboard) {
		const markdownEditor =
			keyboard.parentElement.querySelector(".markdown-editor");
		this.#renderControls(keyboard, markdownEditor);
		this.#renderMediaList(keyboard, markdownEditor);
	}

	#createKeyboardHeader = () => {
		const header = DOM.create("div", "gif-keyboard-header");

		const options = Object.values(keyboardTabs).map((option) =>
			Option(option, option === this.#activeTab, (event) => {
				this.#activeTab = option;
				const keyboard =
					event.target.parentElement.parentElement.parentElement; // oh god
				this.#refreshKeyboard(keyboard);
				event.target.parentElement.parentElement.replaceWith(
					this.#createKeyboardHeader(),
				);
			}),
		);
		header.append(Select(options));

		header.append(
			RangeField(
				this.config.gifSize,
				(event) => {
					this.config.gifSize = event.target.value;
					this.config.save();
				},
				600,
				10,
				10,
			),
		);
		return header;
	};

	#addOrRemoveMedia(url, mediaType) {
		let mediaList =
			mediaType === keyboardTabs.gifs
				? this.config.gifs
				: this.config.images;
		if (mediaList.includes(url)) {
			mediaList = mediaList.filter((media) => media !== url);
		} else {
			mediaList.push(url);
		}
		switch (mediaType) {
			case keyboardTabs.gifs:
				this.config.gifs = mediaList;
				break;
			case keyboardTabs.images:
				this.config.images = mediaList;
				break;
		}
	}

	#toggleKeyboardVisibility(keyboard) {
		if (keyboard.classList.contains("void-hidden")) {
			this.#refreshKeyboard(keyboard);
			keyboard.classList.remove("void-hidden");
		} else {
			keyboard.classList.add("void-hidden");
		}
	}

	#renderMediaList(keyboard, markdownEditor) {
		if (!keyboard || !markdownEditor) {
			return;
		}
		const mediaItems = keyboard.querySelector(".void-gif-keyboard-list");
		const columns = [1, 2, 3].map(() => {
			return DOM.create("div", "gif-keyboard-list-column");
		});
		mediaItems.replaceChildren(...columns);
		const textarea = markdownEditor.parentElement.querySelector("textarea");
		const mediaList =
			this.#activeTab === keyboardTabs.gifs
				? this.config.gifs
				: this.config.images;
		if (mediaList.length === 0) {
			mediaItems.replaceChildren(
				DOM.create(
					"div",
					"gif-keyboard-list-placeholder",
					this.#activeTab === keyboardTabs.gifs
						? "It's pronounced GIF."
						: "You have no funny memes :c",
				),
			);
		}
		for (const [index, media] of mediaList
			.slice(
				this.#paginationPage * this.#pageSize,
				this.#paginationPage * this.#pageSize + this.#pageSize,
			)
			.entries()) {
			mediaItems.children.item(index % 3).append(
				GifItem(
					media,
					() => {
						textarea.setRangeText(
							`img${this.config.gifSize}(${media})`,
						);
					},
					() => {
						this.#addOrRemoveMedia(media, this.#activeTab);
						this.config.save();
					},
					mediaList,
				),
			);
		}
	}

	#renderControls(keyboard, markdownEditor) {
		const container = keyboard.querySelector(
			".void-gif-keyboard-control-container",
		);
		const mediaField = this.#createMediaAddField(keyboard, markdownEditor);
		const pagination = this.#createPagination(keyboard, markdownEditor);
		container.replaceChildren(mediaField, pagination);
	}

	#createMediaAddField(keyboard, markdownEditor) {
		const actionfield = ActionInputField(
			"",
			(_, inputField) => {
				this.#handleAddMediaField(inputField, keyboard, markdownEditor);
			},
			AddIcon(),
		);
		actionfield
			.querySelector("input")
			.setAttribute("placeholder", "Add media...");

		return actionfield;
	}

	#handleAddMediaField(inputField, keyboard, markdownEditor) {
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
		this.#addOrRemoveMedia(url, format);
		this.config.save();
		this.#refreshKeyboard(keyboard);
	}

	#createPagination(keyboard, markdownEditor) {
		const container = DOM.create(
			"div",
			"gif-keyboard-pagination-container",
		);
		const mediaList =
			this.#activeTab === keyboardTabs.gifs
				? this.config.gifs
				: this.config.images;
		const maxPages = Math.ceil(mediaList.length / this.#pageSize) - 1;

		if (this.#paginationPage > maxPages) {
			this.#paginationPage = maxPages;
		}

		container.append(
			Pagination(this.#paginationPage, maxPages, (page) => {
				this.#paginationPage = page;
				this.#refreshKeyboards(keyboard, markdownEditor);
			}),
		);
		return container;
	}
}
