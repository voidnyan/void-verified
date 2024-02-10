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

		if (!this.shouldRender()) {
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

	clearCssForProfile() {
		if (this.isCleared) {
			return;
		}
		if (!this.shouldRender()) {
			this.styleHandler.clearStyles(this.styleId);
			this.isCleared = true;
		}
	}

	shouldRender() {
		if (window.location.pathname.startsWith("/settings")) {
			return false;
		}

		if (!this.settings.options.globalCssAutoDisable.getValue()) {
			return true;
		}

		if (
			!window.location.pathname.startsWith("/user/") &&
			!window.location.pathname.startsWith("/activity/")
		) {
			return true;
		}

		const profileCustomCss = document.getElementById(
			"customCSS-automail-styles"
		);

		const styleHandler = new StyleHandler(this.settings);
		const voidActivityStyles = styleHandler.getStyleLink("activity-css");
		const voidUserStyles = styleHandler.getStyleLink("user-css");

		if (voidActivityStyles || voidUserStyles) {
			return false;
		}

		if (!profileCustomCss) {
			return true;
		}

		const shouldRender = profileCustomCss.innerHTML.trim().length === 0;
		return shouldRender;
	}
}
