import { defaultSettings } from "./defaultSettings";

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
}
