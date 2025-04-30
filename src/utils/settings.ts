import { IOptions, ISettings } from "../types/settings";
import {StaticSettings} from "./staticSettings";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {VerifiedUsers} from "./verifiedUsers";
import {AnilistAuth} from "./anilistAuth";

export class Settings implements ISettings {
	localStorageSettings = LocalStorageKeys.settings;
	localStorageAuth = "void-verified-auth";
	version;
	auth = {
		token: AnilistAuth.token,
		expires: AnilistAuth.expires
	};
	anilistUser: string;
	userId;

	verifiedUsers = VerifiedUsers.users;

	options: IOptions = StaticSettings.options;

	constructor() {
		this.version = GM_info.script.version;

	}

	isAuthorized() {
		const isAuthorized = this.auth?.token != null;
		return isAuthorized;
	}

	updateUserOption(username, key, value) {
		VerifiedUsers.updateUserOption(username, key, value);
	}

	removeAuthToken() {
		this.auth = null;
		localStorage.removeItem(this.localStorageAuth);
	}

	saveSettingToLocalStorage(key: string, value: string | boolean) {
		let localSettings = JSON.parse(
			localStorage.getItem(this.localStorageSettings),
		);

		this.options[key].value = value;

		if (localSettings === null) {
			const settings = {
				[key]: value,
			};
			localStorage.setItem(
				this.localStorageSettings,
				JSON.stringify(settings),
			);
			return;
		}

		localSettings[key] = { value };
		localStorage.setItem(
			this.localStorageSettings,
			JSON.stringify(localSettings),
		);
	}
}
