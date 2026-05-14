import { StyleHandler } from "./styleHandler";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {StaticSettings} from "../utils/staticSettings";
import {DOM} from "../utils/DOM";
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

		const textarea = DOM.create<HTMLTextAreaElement>("textarea", "textarea");
		textarea.value = this.css;
		textarea.addEventListener("input", (event: any) => {
			this.updateCss(event.target.value);
		});

		container.append(textarea);

		if (cssName === "global") {
			const notice = DOM.create("div");
			notice.innerText =
				"Please note that Custom CSS is disabled in the settings. \nIn the event that you accidentally disable rendering of critical parts of AniList, navigate to the settings by URL";
			notice.style.fontSize = "11px";
			container.append(notice);
		}

		return container;
	}

}
