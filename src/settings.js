import { defaultSettings } from "./defaultSettings";
import { ColorFunctions } from "./colorFunctions";
import { AnilistAPI } from "./api/anilistAPI";

class Option {
	value;
	defaultValue;
	description;
	category;
	authRequired;
	constructor(option) {
		this.defaultValue = option.defaultValue;
		this.description = option.description;
		this.category = option.category;
		this.authRequired = option.authRequired;
	}

	getValue() {
		if (this.value === "") {
			return this.defaultValue;
		}
		return this.value ?? this.defaultValue;
	}
}

export class Settings {
	localStorageUsers = "void-verified-users";
	localStorageSettings = "void-verified-settings";
	localStorageAuth = "void-verified-auth";
	version = GM_info.script.version;
	auth = null;

	verifiedUsers = [];

	options = {};

	constructor() {
		this.verifiedUsers =
			JSON.parse(localStorage.getItem(this.localStorageUsers)) ?? [];

		const settingsInLocalStorage =
			JSON.parse(localStorage.getItem(this.localStorageSettings)) ?? {};

		for (const [key, value] of Object.entries(defaultSettings)) {
			this.options[key] = new Option(value);
		}

		for (const [key, value] of Object.entries(settingsInLocalStorage)) {
			if (!this.options[key]) {
				continue;
			}
			this.options[key].value = value.value;
		}

		this.auth =
			JSON.parse(localStorage.getItem(this.localStorageAuth)) ?? null;
	}

	verifyUser(username) {
		if (
			this.verifiedUsers.find(
				(user) => user.username.toLowerCase() === username.toLowerCase()
			)
		) {
			return;
		}

		this.verifiedUsers.push({ username });
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers)
		);

		const anilistAPI = new AnilistAPI(this);
		anilistAPI.queryUserData();
	}

	getUser(username) {
		return this.verifiedUsers.find((user) => user.username === username);
	}

	isVerified(username) {
		return this.verifiedUsers.some((user) => user.username === username);
	}

	updateUserOption(username, key, value) {
		this.verifiedUsers = this.verifiedUsers.map((u) =>
			u.username === username
				? {
						...u,
						[key]: value,
				  }
				: u
		);
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers)
		);
	}

	updateUserFromApi(user, apiUser) {
		const newUser = this.#mapApiUser(user, apiUser);
		this.verifiedUsers = this.verifiedUsers.map((u) =>
			u.username.toLowerCase() === user.username.toLowerCase()
				? newUser
				: u
		);

		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers)
		);
	}

	#mapApiUser(user, apiUser) {
		let userObject = { ...user };

		userObject.color = this.#handleAnilistColor(
			apiUser.options.profileColor
		);

		userObject.username = apiUser.name;
		userObject.avatar = apiUser.avatar.large;
		userObject.banner = apiUser.bannerImage;
		userObject.lastFetch = new Date();

		if (this.options.quickAccessBadge.getValue() || user.quickAccessBadge) {
			if (
				(user.avatar && user.avatar !== userObject.avatar) ||
				(user.color && user.color !== userObject.color) ||
				(user.banner && user.banner !== userObject.banner)
			) {
				userObject.quickAccessBadgeDisplay = true;
			}
		}

		return userObject;
	}

	saveAuthToken(tokenObject) {
		this.auth = tokenObject;
		localStorage.setItem(
			this.localStorageAuth,
			JSON.stringify(tokenObject)
		);
	}

	removeAuthToken() {
		this.auth = null;
		localStorage.removeItem(this.localStorageAuth);
	}

	removeUser(username) {
		this.verifiedUsers = this.verifiedUsers.filter(
			(user) => user.username !== username
		);
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers)
		);
	}

	saveSettingToLocalStorage(key, value) {
		let localSettings = JSON.parse(
			localStorage.getItem(this.localStorageSettings)
		);

		this.options[key].value = value;

		if (localSettings === null) {
			const settings = {
				[key]: value,
			};
			localStorage.setItem(
				this.localStorageSettings,
				JSON.stringify(settings)
			);
			return;
		}

		localSettings[key] = { value };
		localStorage.setItem(
			this.localStorageSettings,
			JSON.stringify(localSettings)
		);
	}

	#defaultColors = [
		"gray",
		"blue",
		"purple",
		"green",
		"orange",
		"red",
		"pink",
	];

	#defaultColorRgb = {
		gray: "103, 123, 148",
		blue: "61, 180, 242",
		purple: "192, 99, 255",
		green: "76, 202, 81",
		orange: "239, 136, 26",
		red: "225, 51, 51",
		pink: "252, 157, 214",
	};

	#handleAnilistColor(color) {
		if (this.#defaultColors.includes(color)) {
			return this.#defaultColorRgb[color];
		}

		return ColorFunctions.hexToRgb(color);
	}
}
