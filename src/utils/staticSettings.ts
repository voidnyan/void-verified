import {IOption, IOptions, ISettings} from "../types/settings";
import {categories, defaultSettings} from "../assets/defaultSettings";
import {Settings} from "./settings";

export class Option implements IOption {
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
	}

	getValue() {
		if (this.value === "") {
			return this.defaultValue;
		}
		return this.value ?? this.defaultValue;
	}
}

export class StaticSettings {
	static #localStorageSettings = "void-verified-settings";
	static options: IOptions = {} as IOptions;
	static settingsInstance: ISettings;

	static initialize() {
		const settingsInLocalStorage =
			JSON.parse(localStorage.getItem(this.#localStorageSettings)) ?? {};

		for (const [key, value] of Object.entries(defaultSettings)) {
			StaticSettings.options[key] = new Option(value as IOption);
		}

		for (const [key, val] of Object.entries(settingsInLocalStorage)) {
			const value = val as IOption;
			if (!this.options[key]) {
				continue;
			}
			StaticSettings.options[key].value = value.value;
		}

		this.settingsInstance = new Settings();
	}
}
