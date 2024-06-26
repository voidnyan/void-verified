export class AceEditorInitializer {
	static initializeEditor(id: string, value: string) {
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
		const editor = ace.edit(id, {
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
			showPrintMargin: false
		});
	}

	static addChangeHandler(id: string, callback: (value: string) => void) {
		// @ts-ignore
		const editor = ace.edit(id)
		editor.on("change", () => {
			callback(editor.getValue());
		})
	}
}
