import {AnilistAPI} from "../api/anilistAPI";
import {ColorFunctions} from "../utils/colorFunctions";
import {StyleHandler} from "./styleHandler";
import LZString from "../libraries/lz-string";
import {Toaster} from "../utils/toaster";
import {DOM} from "../utils/DOM";
import {ActionInputField, Link, TextArea} from "../components/components";
import {SearchDocumentIcon} from "../assets/icons";
import {AceEditorInitializer} from "../utils/aceEditorInitializer";
import {CssCache} from "../utils/cssCache";

export class UserCSS {
	#settings;
	#currentActivity;
	#currentUser;
	css = "";
	preview = false;
	cssInLocalStorage = "void-verified-user-css";
	broadcastChannel;
	#csspy = {
		username: "",
		css: "",
	};

	constructor(settings) {
		this.#settings = settings;
		if (
			this.#settings.auth?.token &&
			this.#settings.options.profileCssEnabled.getValue()
		) {
			const cssInLocalStorage = JSON.parse(
				localStorage.getItem(this.cssInLocalStorage),
			);
			if (cssInLocalStorage) {
				this.css = cssInLocalStorage.css;
				this.preview = cssInLocalStorage.preview;
			} else {
				this.getAuthUserCss();
			}
		}

		this.broadcastChannel = new BroadcastChannel("user-css");
		this.broadcastChannel.addEventListener("message", (event) =>
			this.#handleBroadcastMessage(event, this.#settings),
		);
	}

	async checkActivityCss() {
		if (
			!this.#settings.options.activityCssEnabled.getValue() ||
			!window.location.pathname.startsWith("/activity/")
		) {
			return;
		}

		const activityId = window.location.pathname.match(
			/^\/activity\/([^/]*)\/?/,
		)[1];

		if (this.#currentActivity === activityId) {
			return;
		}

		this.#currentActivity = activityId;

		if (this.#settings.options.cacheUserCss.getValue() && !this.preview) {
			const activityUsername = document.querySelector(".activity-entry > .wrap a.name").innerText.trim();
			if (!this.#shouldRenderCss(activityUsername)) {
				return;
			}
			const cachedCss = CssCache.get(activityUsername);
			if (cachedCss) {
				new StyleHandler(this.#settings).clearStyles("user-css");
				this.#renderCss(cachedCss.css, "user-css");
				this.#setActivityColor(cachedCss.userColor);
				Toaster.debug("Found CSS from cache.");
				return;
			}
		}

		let activity;
		try {
			Toaster.debug("Querying user activity.");
			const anilistAPI = new AnilistAPI(this.#settings);
			activity = await anilistAPI.getActivityCss(activityId);
		} catch {
			Toaster.error("Failed to get activity CSS.");
			return;
		}

		const username = activity.user?.name ?? activity.recipient?.name;

		const userColor =
			activity.user?.options.profileColor ??
			activity.recipient?.options.profileColor;

		this.#setActivityColor(userColor);

		if (username === this.#settings.anilistUser && this.preview) {
			this.#renderCss(this.css, "user-css");
			return;
		}

		if (username === this.#currentUser) {
			this.#clearGlobalCss();
			return;
		}
		new StyleHandler(this.#settings).clearStyles("user-css");

		if (!this.#shouldRenderCss(username)) {
			return;
		}

		const about = activity.user?.about ?? activity.recipient?.about;

		const css = this.#decodeAbout(about)?.customCSS;
		if (css) {
			this.#renderCss(css, "user-css");
		} else {
			Toaster.debug("User has no custom CSS.");
		}

		this.#currentUser = username;

		if (this.#settings.options.cacheUserCss.getValue() && (css || userColor)) {
			CssCache.set(username, css, userColor);
		}
	}

	#setActivityColor(userColor) {
		const rgb = ColorFunctions.handleAnilistColor(userColor);

		const activityEntry = document.querySelector(
			".container > .activity-entry",
		);

		activityEntry.style.setProperty("--color-blue", rgb);
		activityEntry.style.setProperty("--color-blue-dim", rgb);
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

		if (!this.#shouldRenderCss(username)) {
			new StyleHandler(this.#settings).clearStyles("user-css");
			return;
		}

		this.#currentUser = username;

		if (this.#settings.options.cacheUserCss.getValue()) {
			const cachedCss = CssCache.getCss(username);
			if (cachedCss) {
				Toaster.debug("Found CSS from cache.");
				this.#renderCss(cachedCss, "user-css");
				return;
			}
		}

		let about;
		let userColor;
		try {
			Toaster.debug("Querying user CSS.");
			const anilistAPI = new AnilistAPI(this.#settings);
			const user = await anilistAPI.getUserCssAndColour(username)
			about = user?.about;
			userColor = user?.options?.profileColor;
		} catch (error) {
			Toaster.error("Failed to load user's CSS.");
			return;
		}

		const css = this.#decodeAbout(about)?.customCSS;
		if (!css) {
			Toaster.debug("User has no custom CSS.");
			new StyleHandler(this.#settings).clearStyles("user-css");
		}
		this.#renderCss(css, "user-css");
		if (this.#settings.options.cacheUserCss.getValue() && (css || userColor)) {
			CssCache.set(username, css, userColor);
		}
	}

	resetCurrentUser() {
		this.#currentUser = null;
	}

	updateCss(css) {
		this.css = css;
		if (this.preview) {
			this.broadcastChannel.postMessage({type: "css", css});
		}
		this.#saveToLocalStorage();
	}

	async publishUserCss() {
		const username = this.#settings.anilistUser;
		if (!username) {
			return;
		}

		const anilistAPI = new AnilistAPI(this.#settings);
		let about;
		try {
			Toaster.debug("Querying account user about to merge changes into.");
			about = await anilistAPI.getUserAbout(username);
		} catch (error) {
			Toaster.error("Failed to get current about for merging new CSS.");
			return;
		}
		if (!about) {
			about = "";
		}
		let aboutJson = this.#decodeAbout(about);
		aboutJson.customCSS = this.css;
		const compressedAbout = LZString.compressToBase64(
			JSON.stringify(aboutJson),
		);

		const target = about.match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/)?.[1];

		if (target) {
			about = about.replace(target, compressedAbout);
		} else {
			about = `[](json${compressedAbout})\n\n` + about;
		}
		try {
			Toaster.debug("Publishing CSS.");
			await anilistAPI.saveUserAbout(about);
			if (this.#settings.options.cacheUserCss.getValue()) {
				CssCache.clear(this.#settings.anilistUser);
			}
			Toaster.success("CSS published.");
		} catch (error) {
			Toaster.error("Failed to publish CSS changes.");
		}
	}

	togglePreview() {
		this.preview = !this.preview;
		this.broadcastChannel.postMessage({
			type: "preview",
			preview: this.preview,
		});
		this.#saveToLocalStorage();
	}

	async getAuthUserCss() {
		const anilistAPI = new AnilistAPI(this.#settings);
		const username = this.#settings.anilistUser;
		if (!username) {
			return;
		}
		try {
			Toaster.debug("Querying account user CSS.");
			const about = await anilistAPI.getUserAbout(username);
			const css = this.#decodeAbout(about).customCSS;
			this.css = css;
			this.#saveToLocalStorage();
			return css;
		} catch (error) {
			Toaster.error("Failed to query account user CSS.");
		}
	}

	renderCSSpy(settingsUi) {
		const container = DOM.create("div");
		container.append(DOM.create("h3", null, "CSSpy"));

		const usernameInput = ActionInputField(
			"",
			(_, inputField) => {
				this.#handleSpy(inputField, settingsUi);
			},
			SearchDocumentIcon(),
		);

		container.append(usernameInput);

		if (this.#csspy.css === "") {
			return container;
		}

		const header = DOM.create("h5", "layout-header", [
			Link(
				this.#csspy.username,
				`https://anilist.co/user/${this.#csspy.username}/`,
			),
			`'s CSS`,
		]);

		const cssContainer = AceEditorInitializer.createEditor("css-spy-container", this.#csspy.css);

		setTimeout(() => {
			ace.edit("void-css-spy-container").setOption("readOnly", true);
		}, 160);

		container.append(header);
		container.append(cssContainer);

		return container;
	}

	async #handleSpy(inputField, settingsUi) {
		const username = inputField.value;
		if (username === "") {
			return;
		}

		try {
			Toaster.debug(`Spying CSS from ${username}.`);
			const about = await new AnilistAPI(this.#settings).getUserAbout(
				username,
			);
			const css = this.#decodeAbout(about)?.customCSS;
			if (css) {
				this.#csspy.css = css;
				this.#csspy.username = username;
				settingsUi.renderSettingsUiContent();
			} else {
				this.#csspy.css = "";
				this.#csspy.username = "";
				Toaster.debug("User has no custom CSS.");
			}
		} catch (error) {
			this.#csspy.css = "";
			this.#csspy.username = "";
			Toaster.error(`There was an error getting CSS for ${username}`);
			console.error(error);
		}
	}

	#handleBroadcastMessage(event, settings) {
		switch (event.data.type) {
			case "css":
				this.#handlePreviewCssMessage(event.data.css, settings);
				break;
			case "preview":
				this.#handlePreviewToggleMessage(event.data.preview);
				break;
		}
	}

	#handlePreviewCssMessage(css, settings) {
		this.css = css;
		const hasUserCss = document.getElementById(
			"void-verified-user-css-styles",
		);
		if (hasUserCss) {
			new StyleHandler(settings).createStyleLink(css, "user-css");
		}
	}

	#handlePreviewToggleMessage(preview) {
		this.preview = preview;
		const hasUserCss = document.getElementById(
			"void-verified-user-css-styles",
		);
		if (!hasUserCss) {
			return;
		}

		this.resetCurrentUser();
		this.resetCurrentActivity();

		this.checkUserCss();
		this.checkActivityCss();
	}

	#saveToLocalStorage() {
		localStorage.setItem(
			this.cssInLocalStorage,
			JSON.stringify({
				css: this.css,
				preview: this.preview,
			}),
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
			(user) => user.onlyLoadCssFromVerifiedUser,
		);
	}

	#renderCss(css, id) {
		if (!css) {
			return;
		}

		const styleHandler = new StyleHandler(this.#settings);
		styleHandler.createStyleLink(css, id);
		this.#clearGlobalCss();
	}

	#clearGlobalCss() {
		if (this.#settings.options.globalCssAutoDisable.getValue()) {
			new StyleHandler(this.#settings).clearStyles("global-css");
		}
	}

	#decodeAbout(about) {
		let json = (about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
		if (!json) {
			return {
				customCss: "",
			};
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
