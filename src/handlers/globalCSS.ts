import { StyleHandler } from "./styleHandler";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {StaticSettings} from "../utils/staticSettings";
import {DOM} from "../utils/DOM";
import {AceEditorInitializer} from "../utils/aceEditorInitializer";
import {Button} from "../components/components";

export class GlobalCSS {
	static styleHandler;
	static styleId = "global-css";
	static css: string;

	static initialize() {
		this.styleHandler = new StyleHandler(StaticSettings.settingsInstance);
		this.css = localStorage.getItem(LocalStorageKeys.globalCSS) ?? "";
		this.createCss();
	}

	static createCss() {
		if (!StaticSettings.options.globalCssEnabled.getValue() || window.location.pathname.startsWith("/settings/developer")) {
			this.styleHandler.clearStyles(this.styleId);
			return;
		}

		this.styleHandler.createStyleLink(this.css, this.styleId);
	}

	static updateCss(css) {
		this.css = css;
		this.createCss();
		localStorage.setItem(LocalStorageKeys.globalCSS, css);
	}


	static renderEditor() {
		const cssName = "global";
		const container = DOM.createDiv("css-editor");
		const label = DOM.create("h3", null, `Custom ${cssName} CSS`);
		container.append(label);


		const editor = AceEditorInitializer.createEditor(`custom-css-editor-${cssName}`, this.css);
		container.append(editor);
		AceEditorInitializer.addChangeHandler(`custom-css-editor-${cssName}`, (value) => {
			this.updateCss(value);
		});

		if (cssName === "global") {
			const notice = DOM.create("div");
			notice.innerText =
				"Please note that Custom CSS is disabled in the settings. \nIn the event that you accidentally disable rendering of critical parts of AniList, navigate to the settings by URL";
			notice.style.fontSize = "11px";
			container.append(notice);
		}

		const prettifyButton = Button("Prettify", () => {
			// @ts-ignore
			const beautify = ace.require("ace/ext/beautify");
			// @ts-ignore
			const editor = ace.edit(`void-custom-css-editor-${cssName}`);
			const value = editor.getValue()
				.replace(/(\n\s*\n)+/g, '\n\n')
				.replace(/\{[^\}]*\}/g, (block) => {
					// Remove all empty lines within the block
					return block.replace(/\n\s*\n/g, '\n');
				});
			editor.setValue(value);
			beautify.beautify(editor.session);
		});
		container.append(prettifyButton);
		return container;
	}

}
