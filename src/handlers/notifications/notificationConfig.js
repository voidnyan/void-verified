import { notificationTypes } from "./notificationTypes";

export class NotificationConfig {
	groupNotifications;
	dontGroupWhenFiltering;
	notificationTypes;
	collapsed;
	resetDefaultNotifications;
	addActivityRelation;
	#configInLocalStorage;
	constructor(locaStorageString) {
		this.#configInLocalStorage = locaStorageString;
		const config = JSON.parse(
			localStorage.getItem(this.#configInLocalStorage),
		);
		this.groupNotifications = config?.groupNotifications ?? true;
		this.dontGroupWhenFiltering = config?.dontGroupWhenFiltering ?? true;
		this.notificationTypes = config?.notificationTypes ?? notificationTypes;
		this.collapsed = config?.collapsed ?? false;
		this.resetDefaultNotifications =
			config?.resetDefaultNotifications ?? true;
		this.addActivityRelation = config?.addActivityRelation ?? false;
	}

	save() {
		localStorage.setItem(this.#configInLocalStorage, JSON.stringify(this));
	}
}
