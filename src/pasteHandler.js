import { ImageApiFactory } from "./api/imageApiFactory";

export class PasteHandler {
	settings;

	#imageFormats = [
		"jpg",
		"png",
		"gif",
		"webp",
		"apng",
		"avif",
		"jpeg",
		"svg",
	];

	// #isKeyPressed = false;
	#uploadInProgress = false;
	constructor(settings) {
		this.settings = settings;
	}

	setup() {
		// window.addEventListener("keydown", (event) => {
		// 	this.#handleKeybind(event);
		// });
		// window.addEventListener("keyup", (event) => {
		// 	this.#handleKeybind(event, false);
		// });
		window.addEventListener("paste", (event) => {
			this.#handlePaste(event);
		});
	}

	// #handleKeybind(event, isKeyDown = true) {
	// 	if (this.settings.options.pasteKeybind.getValue() !== event.key) {
	// 		return;
	// 	}
	// 	this.#isKeyPressed = isKeyDown;
	// }

	async #handlePaste(event) {
		if (event.target.tagName !== "TEXTAREA") {
			return;
		}

		const clipboard = event.clipboardData.getData("text/plain").trim();
		const file = event.clipboardData.items[0]?.getAsFile();
		let result = [];
		if (
			file &&
			file.type.startsWith("image/") &&
			this.settings.options.pasteImagesToHostService.getValue()
		) {
			event.preventDefault();
			if (this.#uploadInProgress) {
				return;
			}
			this.#uploadInProgress = true;
			document.body.setAttribute("id", "void-upload-in-progess");
			try {
				const imageApi = new ImageApiFactory().getImageHostInstance();
				const response = await imageApi.uploadImage(file);
				result.push(this.#handleRow(response.data.url));
			} catch (error) {
				console.error(error);
			} finally {
				this.#uploadInProgress = false;
				document.body.removeAttribute("id");
			}
		} else if (this.settings.options.pasteEnabled.getValue()) {
			event.preventDefault();
			const rows = clipboard.split("\n");

			for (let row of rows) {
				result.push(this.#handleRow(row));
			}
		} else {
			return;
		}

		const transformedClipboard = result.join("\n\n");
		window.document.execCommand("insertText", false, transformedClipboard);
	}

	#handleRow(row) {
		row = row.trim();
		if (
			this.#imageFormats.some((format) =>
				row.toLowerCase().endsWith(format)
			)
		) {
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
