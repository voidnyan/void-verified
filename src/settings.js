import { defaultSettings } from "./defaultSettings";
import { ColorFunctions } from "./colorFunctions";

export class Settings {
	localStorageUsers = "void-verified-users";
	localStorageSettings = "void-verified-settings";
	version = "1.2.0";

	verifiedUsers = [];

	options = defaultSettings;

	constructor() {
		this.verifiedUsers =
			JSON.parse(localStorage.getItem(this.localStorageUsers)) ?? [];

		const settingsInLocalStorage =
			JSON.parse(localStorage.getItem(this.localStorageSettings)) ?? {};

		for (const [key, value] of Object.entries(settingsInLocalStorage)) {
			if (!this.options[key]) {
				continue;
			}
			this.options[key].value = value.value;
		}
	}

	getOptionValue(object) {
		if (object.value === "") {
			return object.defaultValue;
		}
		return object.value ?? object.defaultValue;
	}

	verifyUser(username) {
		if (this.verifiedUsers.find((user) => user.username === username)) {
			return;
		}

		this.verifiedUsers.push({ username });
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers)
		);
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

	updateUserFromApi(username, user) {
		const color = this.#handleAnilistColor(user.options.profileColor);
		this.verifiedUsers = this.verifiedUsers.map((u) =>
			u.username === username
				? {
						...u,
						color,
						lastFetch: new Date(),
				  }
				: u
		);

		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers)
		);
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
