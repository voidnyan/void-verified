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
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {IAddGifDto} from "../api/voidApi/types/gifInterfaces";
import {VoidApi} from "../api/voidApi";
import {StaticSettings} from "../utils/staticSettings";
import {Time} from "../utils/time";
import {NativeMarkdownEditor} from "../components/nativeMarkdownEditor/nativeMarkdownEditor";

const keyboardTabs = {
	gifs: "GIFS",
	images: "Images",
};

class GifKeyboardConfig {
	gifs;
	gifSize;
	images;
	lastSyncTime?: Date;
	#configInLocalStorage = LocalStorageKeys.gifKeyboardConfig;
	constructor() {
		const config = JSON.parse(
			localStorage.getItem(this.#configInLocalStorage),
		);
		this.gifs = config?.gifs ?? [];
		this.images = config?.images ?? [];
		this.gifSize = config?.gifSize ?? 260;
		this.lastSyncTime = config?.lastSyncTime ? new Date(config?.lastSyncTime) : undefined;
	}

	save() {
		localStorage.setItem(
			LocalStorageKeys.gifKeyboardConfig,
			JSON.stringify(this),
		);
	}
}

export class GifKeyboardHandler {
	static #activeTab = keyboardTabs.gifs;
	static #paginationPage = 0;
	static #pageSize = 30;
	static config = new GifKeyboardConfig();

	static handleGifKeyboard() {
		this.addGifKeyboards();
		this.addMediaLikeButtons();
	}

	static async getGifsFromApi() {
		if (!StaticSettings.options.syncGifsToVoidApi.getValue()) {
			return;
		}

		if (!this.config.lastSyncTime) {
			StaticSettings.options.syncGifsToVoidApi.onValueSet();
			return;
		}

		if (this.config.lastSyncTime && !Time.hasTimePassed(this.config.lastSyncTime, {minutes: 60})) {
			return;
		}

		try {
			const gifs = await VoidApi.getGifs();
			this.config.gifs = [];
			this.config.images = [];
			for (const gif of gifs) {
				const isGif = gif.url.endsWith(".gif");
				this.addMedia(gif.url, isGif ? keyboardTabs.gifs : keyboardTabs.images);
			}
			this.config.lastSyncTime = new Date();
			this.config.save();
		} catch (error) {
			Toaster.error("There was an error syncing gifs with VoidAPI.", error);
		}
	}

	static async syncGifs() {
		const gifs: IAddGifDto[] = [...GifKeyboardHandler.config.gifs, ...GifKeyboardHandler.config.images].map(x => {
			return {url: x};
		});
		try {
			Toaster.debug("Uploading local gif collection to VoidAPI.");
			const gifsFromApi = await VoidApi.addGifs(gifs);
			for (const gif of gifsFromApi) {
				const isGif = gif.url.endsWith(".gif");
				GifKeyboardHandler.addMedia(gif.url, isGif ? keyboardTabs.gifs : keyboardTabs.images);
			}
			GifKeyboardHandler.config.lastSyncTime = new Date();
			GifKeyboardHandler.config.save();
		} catch (error) {
			Toaster.error("Failed to upload gifs to VoidAPI.", error);
		}
	}

	private static addMediaLikeButtons() {
		if (!StaticSettings.options.gifKeyboardEnabled.getValue() ||
			!StaticSettings.options.gifKeyboardLikeButtonsEnabled.getValue()) {
			return;
		}

		const gifs = document.querySelectorAll(
			":is(.activity-markdown, .reply-markdown) .markdown img[src$='.gif']:not(.void-toudai-card-image, .void-toudai-card-link-icon)",
		);
		for (const gif of gifs) {
			this.addMediaLikeButton(gif, keyboardTabs.gifs, this.config.gifs);
		}

		const images = ImageFormats.map((format) => {
			return [
				...document.querySelectorAll(
					`:is(.activity-markdown, .reply-markdown) .markdown img[src$='.${format}']:not(.void-toudai-card-image, .void-toudai-card-link-icon)`,
				),
			];
		}).flat(1);
		for (const image of images) {
			this.addMediaLikeButton(
				image,
				keyboardTabs.images,
				this.config.images,
			);
		}
	}

	private static addMediaLikeButton(media, mediaType, mediaList) {
		if (media.parentElement.classList.contains("void-gif-like-container")) {
			return;
		}

		const img = media.cloneNode();
		img.removeAttribute("width");

		const gifContainer = GifContainer(
			img,
			() => {
				this. addOrRemoveMedia(media.src, mediaType);
				this.config.save();
				this.refreshKeyboards();
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

	private static addGifKeyboards() {
		if (!StaticSettings.options.gifKeyboardEnabled.getValue()) {
			return;
		}

		const markdownEditors = document.querySelectorAll<HTMLDivElement>(".markdown-editor");
		for (const markdownEditor of markdownEditors) {
			if (markdownEditor.querySelector(".void-gif-button")) {
				continue;
			}

			const editor = new NativeMarkdownEditor(markdownEditor);
			editor.injectToDom();

		}
	}

	private static refreshKeyboards() {
		// TODO: do we need this still? it is mostly an edge case, but signaling to
		// keyboards that there is a new item could be a smoother user experience

		// const keyboards = DOM.getAll("gif-keyboard-container");
		// for (const keyboard of keyboards) {
		// 	this.refreshKeyboard(keyboard);
		// }
	}

	static addOrRemoveMedia(url, mediaType) {
		let mediaList =
			mediaType === keyboardTabs.gifs
				? this.config.gifs
				: this.config.images;
		if (mediaList.includes(url)) {
			mediaList = mediaList.filter((media) => media !== url);
			this.removeMediaFromApi(url);
		} else {
			mediaList.push(url);
			this.addMediaToApi(url);
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

	private static async addMediaToApi(url: string) {
		if (!StaticSettings.options.syncGifsToVoidApi.getValue() || !VoidApi.token) {
			return;
		}

		try {
			await VoidApi.addGif({url});
		} catch (error) {
			Toaster.error("Failed to save media to API.", error);
		}
	}

	private static async removeMediaFromApi(url: string) {
		if (!StaticSettings.options.syncGifsToVoidApi.getValue()) {
			return;
		}

		try {
			await VoidApi.deleteGif({url});
		} catch (error) {
			Toaster.error("Failed to delete media from API.", error);
		}
	}

	public static addMedia(url: string, mediaType: string) {
		let mediaList =
			mediaType === keyboardTabs.gifs
				? this.config.gifs
				: this.config.images;
		if (mediaList.includes(url)) {
			return;
		}

		mediaList.push(url);
		switch (mediaType) {
			case keyboardTabs.gifs:
				this.config.gifs = mediaList;
				break;
			case keyboardTabs.images:
				this.config.images = mediaList;
				break;
		}
		this.config.save();
	}
}
