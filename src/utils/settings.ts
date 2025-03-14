import { ColorFunctions } from "./colorFunctions";
import { AnilistAPI } from "../api/anilistAPI";
import { Toaster } from "./toaster";
import { IOptions, ISettings } from "../types/settings";
import {StaticSettings} from "./staticSettings";
import {LocalStorageKeys} from "../assets/localStorageKeys";



export class Settings implements ISettings {
	localStorageUsers = LocalStorageKeys.verifiedUSers;
	localStorageSettings = LocalStorageKeys.settings;
	localStorageAuth = "void-verified-auth";
	version;
	auth = null;
	anilistUser: string;
	userId;

	verifiedUsers = [];

	options: IOptions = StaticSettings.options;

	constructor() {
		this.version = GM_info.script.version;
		this.verifiedUsers =
			JSON.parse(localStorage.getItem(this.localStorageUsers)) ?? [];

		this.auth =
			JSON.parse(localStorage.getItem(this.localStorageAuth)) ?? null;

		const auth = JSON.parse(localStorage.getItem("auth"));
		this.anilistUser = auth?.name;
		this.userId = auth?.id;
	}

	isAuthorized() {
		const isAuthorized = this.auth?.token != null;
		return isAuthorized;
	}

	async verifyUser(username) {
		if (
			this.verifiedUsers.find(
				(user) =>
					user.username.toLowerCase() === username.toLowerCase(),
			)
		) {
			return;
		}

		this.verifiedUsers.push({ username });
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers),
		);

		try {
			Toaster.debug(`Querying ${username}.`);
			const anilistAPI = new AnilistAPI(this);
			const user = await anilistAPI.queryUser(username);
			this.updateUserFromApi(user);
		} catch (error) {
			Toaster.error("Failed to query new user.");
			console.error(error);
		}
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
				: u,
		);
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers),
		);
	}

	updateUserFromApi(apiUser) {
		let user = this.#findVerifiedUser(apiUser);

		if (!user) {
			return;
		}

		const newUser = this.#mapApiUser(user, apiUser);
		this.#mapVerifiedUsers(newUser);

		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers),
		);
	}

	#findVerifiedUser(apiUser) {
		let user = this.verifiedUsers.find((u) => u.id && u.id === apiUser.id);

		if (user) {
			return user;
		}

		return this.verifiedUsers.find(
			(u) => u.username.toLowerCase() === apiUser.name.toLowerCase(),
		);
	}

	#mapVerifiedUsers(newUser) {
		if (this.verifiedUsers.find((u) => u.id && u.id === newUser.id)) {
			this.verifiedUsers = this.verifiedUsers.map((u) =>
				u.id === newUser.id ? newUser : u,
			);
			return;
		}
		this.verifiedUsers = this.verifiedUsers.map((u) =>
			u.username.toLowerCase() === newUser.username.toLowerCase()
				? newUser
				: u,
		);
	}

	#mapApiUser(user, apiUser) {
		let userObject = { ...user };

		userObject.color = ColorFunctions.handleAnilistColor(
			apiUser.options.profileColor,
		);

		userObject.username = apiUser.name;
		userObject.avatar = apiUser.avatar.large;
		userObject.banner = apiUser.bannerImage;
		userObject.id = apiUser.id;
		userObject.lastFetch = new Date();

		if (this.options.quickAccessBadge.getValue() || user.quickAccessBadge) {
			if (
				(user.avatar && user.avatar !== userObject.avatar) ||
				(user.color && user.color !== userObject.color) ||
				(user.banner && user.banner !== userObject.banner) ||
				(user.username &&
					user.username.toLowerCase() !==
						userObject.username.toLowerCase())
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
			JSON.stringify(tokenObject),
		);
	}

	removeAuthToken() {
		this.auth = null;
		localStorage.removeItem(this.localStorageAuth);
	}

	removeUser(username) {
		this.verifiedUsers = this.verifiedUsers.filter(
			(user) => user.username !== username,
		);
		localStorage.setItem(
			this.localStorageUsers,
			JSON.stringify(this.verifiedUsers),
		);
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
