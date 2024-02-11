import { ImageApiFactory } from "../api/imageApiFactory";
import { ImageFormats } from "../assets/imageFormats";

export class PasteHandler {
	settings;
	#uploadInProgress = false;
	constructor(settings) {
		this.settings = settings;
	}

	setup() {
		window.addEventListener("paste", (event) => {
			this.#handlePaste(event);
		});
	}

	async #handlePaste(event) {
		if (
			event.target.tagName !== "TEXTAREA" &&
			event.target.tagName !== "INPUT"
		) {
			return;
		}

		const clipboard = event.clipboardData.getData("text/plain").trim();
		let result = [];

		const file = event.clipboardData.items[0]?.getAsFile();
		if (file && this.settings.options.pasteImagesToHostService.getValue()) {
			event.preventDefault();
			result = await this.#handleImages(event);
		} else if (this.settings.options.pasteEnabled.getValue()) {
			event.preventDefault();
			const rows = clipboard.split("\n");

			for (let row of rows) {
				result.push(this.#handleRow(row, event));
			}
		} else {
			return;
		}

		const transformedClipboard = result.join("\n\n");
		window.document.execCommand("insertText", false, transformedClipboard);
	}

	async #handleImages(event) {
		const _files = event.clipboardData.items;
		if (this.#uploadInProgress) {
			return;
		}
		this.#uploadInProgress = true;
		document.body.classList.add("void-upload-in-progress");

		const imageApi = new ImageApiFactory().getImageHostInstance();

		const files = Object.values(_files).map((file) => file.getAsFile());
		const images = files.filter((file) => file.type.startsWith("image/"));

		try {
			const results = await Promise.all(
				images.map((image) => imageApi.uploadImage(image))
			);
			return results
				.filter((url) => url !== null)
				.map((url) => this.#handleRow(url, event));
		} catch (error) {
			console.error(error);
			return [];
		} finally {
			this.#uploadInProgress = false;
			document.body.classList.remove("void-upload-in-progress");
		}
	}

	#handleRow(row, event) {
		if (
			event.target.parentElement.classList.contains("void-css-editor") ||
			event.target.tagName === "INPUT"
		) {
			return row;
		}

		row = row.trim();
		if (ImageFormats.some((format) => row.toLowerCase().endsWith(format))) {
			return this.#handleImg(row);
		} else if (row.toLowerCase().startsWith("http")) {
			return `[](${row})`;
		} else {
			return row;
		}
	}

	#handleImg(row) {
		const img = `img${this.settings.options.pasteImageWidth.getValue()}(${row})`;
		let result = img;
		if (this.settings.options.pasteWrapImagesWithLink.getValue()) {
			result = `[ ${img} ](${row})`;
		}
		return result;
	}
}
