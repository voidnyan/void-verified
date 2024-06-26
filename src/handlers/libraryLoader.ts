export class LibraryLoader {
	static loadScript(url: string, callback: () => void) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onload = callback;
		document.head.appendChild(script);
	}

	static loadAceEditor() {
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/ace.min.js", () => {
			// @ts-ignore
			ace.config.set("packaged", true)
			// @ts-ignore
			ace.config.set("basePath", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/ace.min.js");
		});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/worker-css.js'", () => {});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/mode-css.min.js", () => {
			// @ts-ignore
			ace.config.setModuleUrl("ace/mode/css", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/mode-css.min.js");
		});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/ext-inline_autocomplete.min.js", () => {
			// @ts-ignore
			ace.config.setModuleUrl("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/ext-inline_autocomplete.min.js")
		});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/ext-beautify.min.js", () => {
			// @ts-ignore
			ace.config.setModuleUrl("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/ext-beautify.min.js");
		});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.6/theme-monokai.min.js", () => {
			// @ts-ignore
			ace.config.setModuleUrl("https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.6/theme-monokai.min.js");
		});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.6/theme-dawn.min.js", () => {
			// @ts-ignore
			ace.config.setModuleUrl("https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.6/theme-dawn.min.js");
		});
		this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/keybinding-vscode.min.js", () => {
			// @ts-ignore
			ace.config.setModuleUrl("https://cdnjs.cloudflare.com/ajax/libs/ace/1.35.0/keybinding-vscode.min.js");
		});
	}
}
