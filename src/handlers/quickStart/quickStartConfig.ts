import {BaseConfig} from "../../utils/baseConfig";
import {LocalStorageKeys} from "../../assets/localStorageKeys";

export class QuickStartConfig extends BaseConfig {
	openQuickStartKeybind: string;
	addNavigationButtons: boolean;

	usersEnabled: boolean;
	notificationsEnabled: boolean;
	onlyIncludeUnreadNotifications: boolean;

	displayAllResultsOnEmpty: boolean;

	anilistLinksEnabled: boolean;
	voidSettingsEnabled: boolean;

	preserveActivitySearch: boolean;
	constructor() {
		const configInLocalStorage = LocalStorageKeys.quickStartConfig;
		super(configInLocalStorage);
		const config: QuickStartConfig = JSON.parse(localStorage.getItem(configInLocalStorage));
		this.openQuickStartKeybind = config?.openQuickStartKeybind ?? "ctrl+space";

		this.addNavigationButtons = config?.addNavigationButtons ?? true;

		this.usersEnabled = config?.usersEnabled ?? true;
		this.notificationsEnabled = config?.notificationsEnabled ?? true;
		this.onlyIncludeUnreadNotifications = config?.onlyIncludeUnreadNotifications ?? false;

		this.displayAllResultsOnEmpty = config?.displayAllResultsOnEmpty ?? true;
		this.anilistLinksEnabled = config?.anilistLinksEnabled ?? true;
		this.voidSettingsEnabled = config?.voidSettingsEnabled ?? true;

		this.preserveActivitySearch = config?.preserveActivitySearch ?? true;
	}
}
