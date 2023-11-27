import { AnilistAPI } from "./api/anilistAPI";
import { StyleHandler } from "./styleHandler";
import LZString from "./utils/lz-string";

export class UserCSS {
	#settings;
	#currentActivity;
	#currentUser;
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
		const username =
			result.data.Activity.user?.name ??
			result.data.Activity.recipient?.name;

		new StyleHandler(this.#settings).clearStyles("activity-css");
		if (!this.#shouldRenderCss(username)) {
			return;
		}

		const about =
			result.data.Activity.user?.about ??
			result.data.Activity.recipient?.about;

		const css = this.#decodeCss(about);
		if (css) {
			this.#renderCss(css, "activity-css");
		}
	}

	resetCurrentActivity() {
		this.#currentActivity = null;
	}

	async checkUserCss() {
		if (
			!this.#settings.options.profileCssEnabled.getValue() ||
			!window.location.pathname.startsWith("/user/")
		) {
			return;
		}

		const username =
			window.location.pathname.match(/^\/user\/([^/]*)\/?/)[1];

		if (username === this.#currentUser) {
			return;
		}

		new StyleHandler(this.#settings).clearStyles("user-css");
		if (!this.#shouldRenderCss(username)) {
			return;
		}

		this.#currentUser = username;

		const anilistAPI = new AnilistAPI(this.#settings);
		const result = await anilistAPI.getUserCss(username);
		const about = result.User.about;
		const css = this.#decodeCss(about);
		if (css) {
			this.#renderCss(css, "user-css");
		}
	}

	resetCurrentUser() {
		this.#currentUser = null;
	}

	#shouldRenderCss(username) {
		const user = this.#settings.getUser(username);
		if (
			this.#settings.options.onlyLoadCssFromVerifiedUser.getValue() &&
			!this.#settings.isVerified(username)
		) {
			return false;
		}
		if (user?.onlyLoadCssFromVerifiedUser) {
			return true;
		}
		return !this.#userSpecificRenderingExists();
	}

	#userSpecificRenderingExists() {
		return this.#settings.verifiedUsers.some(
			(user) => user.onlyLoadCssFromVerifiedUser
		);
	}

	#renderCss(css, id) {
		if (!css) {
			return;
		}

		const styleHandler = new StyleHandler(this.#settings);
		styleHandler.createStyleLink(css, id);
		if (this.#settings.options.globalCssAutoDisable.getValue()) {
			styleHandler.clearStyles("global-css");
		}
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
