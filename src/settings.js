import { defaultSettings } from "./defaultSettings";
import { ColorFunctions } from "./colorFunctions";
import { AnilistAPI } from "./api/anilistAPI";

class Option {
	value;
	defaultValue;
	description;
	category;
	constructor(option) {
		this.defaultValue = option.defaultValue;
		this.description = option.description;
		this.category = option.category;
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
	version = GM_info.script.version;

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
		userObject.lastFetch = new Date();

		return userObject;
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
