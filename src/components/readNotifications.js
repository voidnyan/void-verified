import {LocalStorageCacheKeys, LocalStorageKeys} from "../assets/localStorageKeys";
import {StaticSettings} from "../utils/staticSettings";
import {VoidApi} from "../api/voidApi";
import {Toaster} from "../utils/toaster";

export class ReadNotifications {
	static #notificationsInLocalStorage = LocalStorageKeys.readNotifications;
	static #unreadNotificationsFeed = new Set();
	static #unreadNotificationsCount = new Set();
	static async getUnreadNotificationsCount(notifications) {
		let readNotifications = this.#getReadNotifications();
		if (StaticSettings.options.syncReadNotifications.getValue()){
			try {
				const voidApiNotifications = new Set(await VoidApi.getReadNotifications(JSON.parse(localStorage.getItem(LocalStorageCacheKeys.notificationsLastSyncTime))));
				voidApiNotifications.forEach(x => {
					if (x.isRead) {
						readNotifications.add(x.id);
					} else {
						readNotifications.delete(x.id);
					}
				});
				this.#saveReadNotifications(readNotifications);
				localStorage.setItem(LocalStorageCacheKeys.notificationsLastSyncTime, JSON.stringify(new Date()));
			} catch (error) {
				Toaster.error("Failed to get read notifications from VoidAPI", error);
			}
		}
		let unreadNotificationsCount = 0;
		this.#unreadNotificationsCount = new Set();
		for (const notification of notifications) {
			if (!readNotifications.has(notification.id)) {
				unreadNotificationsCount++;
				this.#unreadNotificationsCount.add(notification.id);
			}
		}
		return unreadNotificationsCount;
	}

	static markAllAsRead() {
		const readNotifications = this.#getReadNotifications();
		const newlyReadNotifications = new Set();
		this.#unreadNotificationsFeed.forEach((notification) => {
			readNotifications.add(notification);
			newlyReadNotifications.add(notification);
		});
		this.#unreadNotificationsCount.forEach((notification) => {
			readNotifications.add(notification);
			newlyReadNotifications.add(notification);
		});
		this.#unreadNotificationsCount = new Set();
		this.#unreadNotificationsFeed = new Set();
		this.#saveReadNotifications(readNotifications);
		if (StaticSettings.options.syncReadNotifications.getValue()){
			try {
				VoidApi.toggleReadNotifications([...newlyReadNotifications], true);
			} catch (error){
				Toaster.error("Failed to sync read notifications with VoidAPI" ,error);
			}
		}
	}

	static markMultipleAsRead(notifications) {
		const readNotifications = this.#getReadNotifications();
		notifications.forEach((notification) => {
			readNotifications.add(notification);
		});
		this.#saveReadNotifications(readNotifications);
		if (StaticSettings.options.syncReadNotifications.getValue()){
			try {
				VoidApi.toggleReadNotifications([...notifications], true);
			} catch (error){
				Toaster.error("Failed to sync read notifications with VoidAPI" ,error);
			}
		}
	}

	static markMultipleAsUnread(notifications) {
		const readNotifications = this.#getReadNotifications();
		notifications.forEach((notification) => {
			readNotifications.delete(notification);
		});
		this.#saveReadNotifications(readNotifications);
		if (StaticSettings.options.syncReadNotifications.getValue()){
			try {
				VoidApi.toggleReadNotifications([...notifications], false);
			} catch (error){
				Toaster.error("Failed to sync read notifications with VoidAPI" ,error);
			}
		}
	}

	static isRead(notificationId) {
		const readNotifications = this.#getReadNotifications();
		const isRead = readNotifications.has(notificationId);
		if (!isRead) {
			this.#unreadNotificationsFeed.add(notificationId);
		}
		return isRead;
	}

	static resetUnreadNotificationsFeed() {
		this.#unreadNotificationsFeed = new Set();
	}

	static #getReadNotifications() {
		return new Set(
			JSON.parse(localStorage.getItem(this.#notificationsInLocalStorage)),
		);
	}

	static #saveReadNotifications(notifications) {
		let notificationsAsArray = Array.from(notifications);
		if (notificationsAsArray.length > 10000) {
			notificationsAsArray = notificationsAsArray.slice(-10000);
		}
		localStorage.setItem(
			this.#notificationsInLocalStorage,
			JSON.stringify(notificationsAsArray),
		);
	}
}
