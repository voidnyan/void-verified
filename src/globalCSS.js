export class GlobalCSS {
	settings;
	css;

	cssInLocalStorage = "void-verified-global-css";
	constructor(settings) {
		this.settings = settings;

		this.css = localStorage.getItem(this.cssInLocalStorage) ?? "";
	}

	createCss() {
		if (
			!this.settings.getOptionValue(
				this.settings.Options.globalCssEnabled
			)
		) {
			return;
		}
	}

	updateCss(css) {
		localStorage.setItem(this.cssInLocalStorage, css);
	}
}
