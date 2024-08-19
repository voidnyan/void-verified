import { StyleHandler } from "./styleHandler";

export class GlobalCSS {
	settings;
	styleHandler;

	styleId = "global-css";
	isCleared = false;

	cssInLocalStorage = "void-verified-global-css";
	constructor(settings) {
		this.settings = settings;
		this.styleHandler = new StyleHandler(settings);

		this.css = localStorage.getItem(this.cssInLocalStorage) ?? "";
	}

	createCss() {
		if (!this.settings.options.globalCssEnabled.getValue()) {
			this.styleHandler.clearStyles(this.styleId);
			return;
		}

		this.isCleared = false;
		this.styleHandler.createStyleLink(this.css, this.styleId);
	}

	updateCss(css) {
		this.css = css;
		this.createCss();
		localStorage.setItem(this.cssInLocalStorage, css);
	}

}
