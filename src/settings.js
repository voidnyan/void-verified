import { GlobalCSS } from "./globalCSS";

export class Settings {
	LocalStorageUsers = "void-verified-users";
	LocalStorageSettings = "void-verified-settings";
	Version = "DEV";

	Options = {
		copyColorFromProfile: {
			defaultValue: true,
			description: "Copy user color from their profile when visited.",
		},
		moveSubscribeButtons: {
			defaultValue: false,
			description:
				"Move activity subscribe button next to comments and likes.",
		},
		hideLikeCount: {
			defaultValue: false,
			description: "Hide activity and reply like counts.",
		},
		enabledForUsername: {
			defaultValue: true,
			description: "Display a verified sign next to usernames.",
		},
		enabledForProfileName: {
			defaultValue: false,
			description: "Display a verified sign next to a profile name.",
		},
		defaultSign: {
			defaultValue: "✔",
			description: "The default sign displayed next to a username.",
		},
		highlightEnabled: {
			defaultValue: true,
			description: "Highlight user activity with a border.",
		},
		highlightEnabledForReplies: {
			defaultValue: true,
			description: "Highlight replies with a border.",
		},
		highlightSize: {
			defaultValue: "5px",
			description: "Width of the highlight border.",
		},
		useDefaultHighlightColor: {
			defaultValue: false,
			description:
				"Use fallback highlight color when user color is not specified.",
		},
		defaultHighlightColor: {
			defaultValue: "#FFFFFF",
			description: "Fallback highlight color.",
		},
		globalCssEnabled: {
			defaultValue: false,
			description: "Enable custom global CSS.",
		},
		globalCssAutoDisable: {
			defaultValue: true,
			description: "Disable global CSS when a profile has custom CSS.",
		},
	};

	VerifiedUsers = [];

	constructor() {
		this.VerifiedUsers =
			JSON.parse(localStorage.getItem(this.LocalStorageUsers)) ?? [];

		const settingsInLocalStorage =
			JSON.parse(localStorage.getItem(this.LocalStorageSettings)) ?? {};

		for (const [key, value] of Object.entries(settingsInLocalStorage)) {
			if (!this.Options[key]) {
				continue;
			}
			this.Options[key].value = value.value;
		}
	}

	getOptionValue(object) {
		if (object.value === "") {
			return object.defaultValue;
		}
		return object.value ?? object.defaultValue;
	}

	verifyUser(username) {
		if (this.VerifiedUsers.find((user) => user.username === username)) {
			return;
		}

		this.VerifiedUsers.push({ username });
		localStorage.setItem(
			this.LocalStorageUsers,
			JSON.stringify(this.VerifiedUsers)
		);
	}

	updateUserOption(username, key, value) {
		this.VerifiedUsers = this.VerifiedUsers.map((u) =>
			u.username === username
				? {
						...u,
						[key]: value,
				  }
				: u
		);
		localStorage.setItem(
			this.LocalStorageUsers,
			JSON.stringify(this.VerifiedUsers)
		);
	}

	removeUser(username) {
		this.VerifiedUsers = this.VerifiedUsers.filter(
			(user) => user.username !== username
		);
		localStorage.setItem(
			this.LocalStorageUsers,
			JSON.stringify(this.VerifiedUsers)
		);
	}

	saveSettingToLocalStorage(key, value) {
		let localSettings = JSON.parse(
			localStorage.getItem(this.LocalStorageSettings)
		);

		this.Options[key].value = value;

		if (localSettings === null) {
			const settings = {
				[key]: value,
			};
			localStorage.setItem(
				this.LocalStorageSettings,
				JSON.stringify(settings)
			);
			return;
		}

		localSettings[key] = { value };
		localStorage.setItem(
			this.LocalStorageSettings,
			JSON.stringify(localSettings)
		);
	}
}
