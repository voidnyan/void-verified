import { notificationTypes } from "./notificationTypes";

export class NotificationConfig {
	groupNotifications;
	notificationTypes;

	#configInLocalStorage;
	constructor(locaStorageString) {
		this.#configInLocalStorage = locaStorageString;
		const config = JSON.parse(
			localStorage.getItem(this.#configInLocalStorage)
		);
		this.groupNotifications = config?.groupNotifications ?? true;
		this.notificationTypes = config?.notificationTypes ?? notificationTypes;
	}

	save() {
		localStorage.setItem(this.#configInLocalStorage, JSON.stringify(this));
	}
}
