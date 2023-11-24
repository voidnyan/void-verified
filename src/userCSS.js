import { AnilistAPI } from "./api/anilistAPI";
import { StyleHandler } from "./styleHandler";
import LZString from "./utils/lz-string";

export class UserCSS {
	#settings;
	#currentActivity;
	constructor(settings) {
		this.#settings = settings;
	}

	async checkActivityCss() {
		if (
			!this.#settings.options.activityCssEnabled.getValue() ||
			!window.location.pathname.startsWith("/activity/")
		) {
			return;
		}

		const activityId = window.location.pathname.match(
			/^\/activity\/([^/]*)\/?/
		)[1];

		if (this.#currentActivity === activityId) {
			return;
		}

		this.#currentActivity = activityId;
		const anilistAPI = new AnilistAPI(this.#settings);
		const result = await anilistAPI.getActivityCss(activityId);
		const about =
			result.data.Activity.user?.about ??
			result.data.Activity.recipient?.about;
		const css = this.#decodeCss(about);

		if (!css) {
			return;
		}

		const styleHandler = new StyleHandler(this.#settings);
		if (this.#settings.options.globalCssAutoDisable.getValue()) {
			styleHandler.clearStyles("global-css");
		}
		styleHandler.createStyleLink(css, "activity-css");
		return;
	}

	resetCurrentActivity() {
		this.#currentActivity = null;
	}

	#decodeCss(about) {
		let json = (about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
		if (!json) {
			return null;
		}

		let jsonData;
		try {
			jsonData = JSON.parse(atob(json[1]));
		} catch (e) {
			jsonData = JSON.parse(LZString.decompressFromBase64(json[1]));
		}
		if (jsonData.customCSS) {
			return jsonData.customCSS;
		}
		return null;
	}
}
