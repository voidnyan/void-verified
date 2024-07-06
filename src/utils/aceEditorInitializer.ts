import {DOM} from "./DOM";
import {InputField} from "../components/components";

export class AceEditorInitializer {
	static createEditor(id: string, value: string) {
		const container = DOM.create("div", "ace-editor-container");

		const editor = DOM.create("div", `#${id} ace-editor`);
		// const search = this.#addSearchComponent(id);
		container.append(editor);

		setTimeout(() => {
			this.#initializeEditor(id, value);
		}, 150);

		return container;
	}

	static #initializeEditor(id: string, value: string) {
		const siteTheme = localStorage.getItem("site-theme");
		let theme = "monokai";
		switch (siteTheme) {
			case "dark":
			case "system":
				theme = "monokai";
				break;
			case "contrast":
			default:
				theme = "dawn";
		}
		// @ts-ignore
		const editor = ace.edit(`void-${id}`, {
			mode: "ace/mode/css",
			theme: `ace/theme/${theme}`,
			value: value
		});

		editor.setKeyboardHandler("ace/keyboard/vscode");

		editor.setOptions({
			useWorker: false,
			enableBasicAutocompletion: true,
			highlightSelectedWord: true,
			copyWithEmptySelection: true,
			scrollPastEnd: true,
			showPrintMargin: false,
			wrap: "free"
		});
	}

	static #addSearchComponent(id: string) {
		const container = DOM.create("div", "ace-search-container");
		setTimeout(() => {
			// @ts-ignore
			const editor = ace.edit(`void-${id}`);
			const searchInput = InputField("", (event => {
				const searchword = event.target.value;
				editor.find(searchword);
				console.log(event.target.value);
			}));
			container.append(searchInput);
		}, 160);

		return container;
	}

	static addChangeHandler(id: string, callback: (value: string) => void) {
		setTimeout(() => {
			// @ts-ignore
			const editor = ace.edit(`void-${id}`)
			editor.on("change", () => {
				callback(editor.getValue());
			})
		}, 150);
	}
}
