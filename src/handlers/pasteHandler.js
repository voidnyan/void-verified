import {ImageApiFactory} from "../api/imageApiFactory";
import {ImageFormats} from "../assets/imageFormats";

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

	registerDragAndDropInputs() {
		if (!this.settings.options.pasteImagesToHostService.getValue()) {
			return;
		}
		const inputs = document.querySelectorAll("textarea, input");

		for (const input of inputs) {
			this.#registerDragAndDropInput(input);
		}
	}

	#registerDragAndDropInput(input) {
		input.addEventListener("drop", this.#handleDrop.bind(this));
		input.addEventListener("dragenter", () => {
			input.classList.add("void-drag-indicator");
		});
		input.addEventListener("dragleave", () => {
			input.classList.remove("void-drag-indicator");
		});
	}

	async #handleDrop(event) {
		if (
			event.target.tagName !== "TEXTAREA" &&
			event.target.tagName !== "INPUT" ||
			event.target.classList.contains("input-file")
		) {
			return;
		}

		event.preventDefault();
		event.target.classList.remove("void-drag-indicator");
		const currentValue = event.target.value;
		const start = event.target.selectionStart;
		const end = event.target.selectionEnd;
		const beforeSelection = currentValue.substring(0, start);
		const selection = currentValue.substring(start, end);
		const afterSelection = currentValue.substring(end);

		let files;
		if (event.dataTransfer.items) {
			files = [...event.dataTransfer.items].map(item => item.getAsFile());
		} else {
			files = [...event.dataTransfer.files];
		}

		const images = files.filter((file) => file.type.startsWith("image/"));

		const result = await this.#handleImages(event, images);
		const transformedClipboard = result.join("\n\n");

		event.target.value = `${beforeSelection}${transformedClipboard}${afterSelection}`;
		event.target.selectionStart = start;
		event.target.selectionEnd = start + transformedClipboard.length;
		event.target.dispatchEvent(new Event('input', {bubbles: true}));
	}

	async #handlePaste(event) {
		if (
			event.target.tagName !== "TEXTAREA" &&
			event.target.tagName !== "INPUT"
		) {
			return;
		}

		const clipboard = event.clipboardData.getData("text/plain").trim();

		const file = event.clipboardData.items[0]?.getAsFile();
		if (file && this.settings.options.pasteImagesToHostService.getValue()) {
			event.preventDefault();
			const _files = event.clipboardData.items;
			const files = Object.values(_files).map((file) => file.getAsFile());
			const images = files.filter((file) => file.type.startsWith("image/"));
			const result = await this.#handleImages(event, images);
			const transformedClipboard = result.join("\n\n");
			window.document.execCommand(
				"insertText",
				false,
				transformedClipboard,
			);
		} else if (this.settings.options.pasteEnabled.getValue()) {
			if (this.#verifyTarget(event)) {
				return;
			}
			event.preventDefault();
			const regex = new RegExp(
				`(?<!\\()\\b(https?:\/\/\\S+\\.(?:${ImageFormats.join(
					"|",
				)}))\\b(?!.*?\\))`,
				"gi",
			);
			const result = clipboard.replace(
				regex,
				(match) =>
					`img${this.settings.options.pasteImageWidth.getValue()}(${match})`,
			);
			window.document.execCommand("insertText", false, result);
			return;
		}
	}

	async #handleImages(event, images) {
		if (this.#uploadInProgress) {
			return;
		}
		this.#uploadInProgress = true;
		document.body.classList.add("void-upload-in-progress");

		const imageApi = new ImageApiFactory().getImageHostInstance();

		try {
			const results = await Promise.all(
				images.map((image) => imageApi.uploadImage(image)),
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
		if (this.#verifyTarget(event)) {
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

	#verifyTarget(event) {
		return event.target.classList.contains("ace_text-input") ||
			event.target.tagName === "INPUT";
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
