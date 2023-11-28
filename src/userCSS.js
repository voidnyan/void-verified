import { AnilistAPI } from "./api/anilistAPI";
import { StyleHandler } from "./styleHandler";
import LZString from "./utils/lz-string";

export class UserCSS {
	#settings;
	#currentActivity;
	#currentUser;
	css = "";
	preview = false;
	cssInLocalStorage = "void-verified-user-css";
	constructor(settings) {
		this.#settings = settings;
		if (
			this.#settings.auth?.token &&
			this.#settings.options.profileCssEnabled.getValue()
		) {
			const cssInLocalStorage = JSON.parse(
				localStorage.getItem(this.cssInLocalStorage)
			);
			if (cssInLocalStorage) {
				this.css = cssInLocalStorage.css;
				this.preview = cssInLocalStorage.preview;
			} else {
				this.getAuthUserCss();
			}
		}
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

		const css = this.#decodeAbout(about)?.customCSS;
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

		if (username === this.#settings.anilistUser && this.preview) {
			this.#renderCss(this.css, "user-css");
			return;
		}

		new StyleHandler(this.#settings).clearStyles("user-css");
		if (!this.#shouldRenderCss(username)) {
			return;
		}

		this.#currentUser = username;

		const anilistAPI = new AnilistAPI(this.#settings);
		const result = await anilistAPI.getUserAbout(username);
		const about = result.User.about;
		const css = this.#decodeAbout(about)?.customCSS;
		if (css) {
			this.#renderCss(css, "user-css");
		}
	}

	resetCurrentUser() {
		this.#currentUser = null;
	}

	updateCss(css) {
		this.css = css;
		this.#saveToLocalStorage();
	}

	async publishUserCss() {
		const username = this.#settings.anilistUser;
		if (!username) {
			return;
		}

		const anilistAPI = new AnilistAPI(this.#settings);
		const result = await anilistAPI.getUserAbout(username);
		let about = result.User.about;
		let aboutJson = this.#decodeAbout(about);
		aboutJson.customCSS = this.css;
		const compressedAbout = LZString.compressToBase64(
			JSON.stringify(aboutJson)
		);

		const target = about.match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/)[1];
		if (target) {
			about = about.replace(target, compressedAbout);
		} else {
			about = `[](json${compressedAbout})` + about;
		}
		const mutationResult = await anilistAPI.saveUserAbout(about);
		return mutationResult?.errors === undefined;
	}

	togglePreview() {
		this.preview = !this.preview;
		this.#saveToLocalStorage();
	}

	async getAuthUserCss() {
		const anilistAPI = new AnilistAPI(this.#settings);
		const username = this.#settings.anilistUser;
		if (!username) {
			return;
		}
		const response = await anilistAPI.getUserAbout(username);
		const about = response.User.about;
		const css = this.#decodeAbout(about).customCSS;
		this.css = css;
		this.#saveToLocalStorage();
		return css;
	}

	#saveToLocalStorage() {
		localStorage.setItem(
			this.cssInLocalStorage,
			JSON.stringify({
				css: this.css,
				preview: this.preview,
			})
		);
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

	#decodeAbout(about) {
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
		return jsonData;
	}
}