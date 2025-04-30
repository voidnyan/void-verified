import {IOption, IOptions, ISettings} from "../types/settings";
import {categories, defaultSettings} from "../assets/defaultSettings";
import {Settings} from "./settings";
import {LocalStorageKeys} from "../assets/localStorageKeys";

export class Option implements IOption {
	key: string;
	value: string | boolean;
	defaultValue: string | number | boolean;
	description: string;
	category: string;
	authRequired: boolean;

	constructor(option: IOption) {
		this.defaultValue = option.defaultValue;
		this.description = option.description;
		this.category = option.category ?? categories.misc;
		this.authRequired = option.authRequired;
		this.key = option.key;
	}

	getValue() {
		if (this.value === "") {
			return this.defaultValue;
		}
		return this.value ?? this.defaultValue;
	}

	setValue(value: string | number | boolean) {
		let localSettings = JSON.parse(
			localStorage.getItem(LocalStorageKeys.settings),
		);

		StaticSettings.options[this.key].value = value;

		if (localSettings === null) {
			const settings = {
				[this.key]: value,
			};
			localStorage.setItem(
				LocalStorageKeys.settings,
				JSON.stringify(settings),
			);
			return;
		}

		localSettings[this.key] = { value };
		localStorage.setItem(
			LocalStorageKeys.settings,
			JSON.stringify(localSettings),
		);
	}
}

export class StaticSettings {
	static #localStorageSettings = LocalStorageKeys.settings;
	static options: IOptions = {} as IOptions;
	static settingsInstance: ISettings;
	static version = GM_info.script.version;

	static initialize() {
		const settingsInLocalStorage =
			JSON.parse(localStorage.getItem(this.#localStorageSettings)) ?? {};

		for (const [key, val] of Object.entries(defaultSettings)) {
			const value = val as IOption;
			value.key = key;
			StaticSettings.options[key] = new Option(value as IOption);
		}

		for (const [key, val] of Object.entries(settingsInLocalStorage)) {
			const value = val as IOption;
			value.key = key;
			if (!this.options[key]) {
				continue;
			}
			StaticSettings.options[key].value = value.value;
		}

		this.settingsInstance = new Settings();
	}
}
