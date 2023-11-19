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

	#isKeyPressed = false;
	constructor(settings) {
		this.settings = settings;
	}

	setup() {
		window.addEventListener("keydown", (event) => {
			this.#handleKeybind(event);
		});
		window.addEventListener("keyup", (event) => {
			this.#handleKeybind(event, false);
		});
		window.addEventListener("paste", (event) => {
			this.#handlePaste(event);
		});
	}

	#handleKeybind(event, isKeyDown = true) {
		if (this.settings.options.pasteKeybind.getValue() !== event.key) {
			return;
		}
		this.#isKeyPressed = isKeyDown;
	}

	#handlePaste(event) {
		const clipboard = event.clipboardData.getData("text/plain").trim();

		if (!this.settings.options.pasteEnabled.getValue()) {
			return;
		}

		if (
			this.settings.options.pasteRequireKeyPress.getValue() &&
			!this.#isKeyPressed
		) {
			return;
		}

		event.preventDefault();
		const rows = clipboard.split("\n");
		let result = [];

		for (let row of rows) {
			result.push(this.#handleRow(row));
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
