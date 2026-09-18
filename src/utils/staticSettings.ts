import {IOption, IOptions, ISettings} from "../types/settings";
import {categories, defaultSettings} from "../assets/defaultSettings";
import {Settings} from "./settings";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {AnilistAuth} from "./anilistAuth";
import {VoidApi} from "../api/voidApi";
import {Checkbox, InputField, SettingLabel} from "../components/components";

export class Option implements IOption {
	key: string;
	value: string | boolean;
	defaultValue: string | number | boolean;
	description: string;
	category: string;
	authRequired: boolean;
	voidApiAuthRequired: boolean;
	onValueSet: () => void;

	constructor(option: IOption) {
		this.defaultValue = option.defaultValue;
		this.description = option.description;
		this.category = option.category ?? categories.misc;
		this.authRequired = option.authRequired;
		this.key = option.key;
		this.voidApiAuthRequired = option.voidApiAuthRequired ?? false;
		this.onValueSet = option.onValueSet;
	}

	createOption(onValueChange?: () => void): HTMLDivElement {
		const value = this.getValue();
		const type = typeof value;

		let input: HTMLInputElement;
		if (type === "boolean") {
			input = Checkbox(value, (event) => {
				this.setValue(event.target.checked);
				onValueChange();

			}) as HTMLInputElement;
		} else if (type === "string" || type === "number") {
			input = InputField(value, (event) => {
				this.setValue(event.target.value);
				onValueChange();
			}) as HTMLInputElement;
			if (type === "number") {
				input.setAttribute("type", type);
			}
		}

		input.setAttribute("id", this.key);
		const settingLabel = SettingLabel(this.description, input) as HTMLDivElement;

		if (this.authRequired) {
			settingLabel.classList.add("void-auth-required");
		}

		if (this.voidApiAuthRequired) {
			settingLabel.classList.add("void-api-auth-required");
		}

		return settingLabel;
	}

	getValue() {
		if (this.authRequired && !AnilistAuth.token) {
			return false;
		}
		if (this.voidApiAuthRequired && !VoidApi.token) {
			return false;
		}
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

		if (this.value === true && this.onValueSet) {
			this.onValueSet();
		}

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

		localSettings[this.key] = {value};
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
			if (!this.options[key]) {
				continue;
			}
			StaticSettings.options[key].value = value.value;
		}

		this.settingsInstance = new Settings();
	}
}
