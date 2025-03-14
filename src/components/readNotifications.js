import {LocalStorageKeys} from "../assets/localStorageKeys";

export class ReadNotifications {
	static #notificationsInLocalStorage = LocalStorageKeys.readNotifications;
	static #unreadNotificationsFeed = new Set();
	static #unreadNotificationsCount = new Set();
	static getUnreadNotificationsCount(notifications) {
		const readNotifications = this.#getReadNotifications();
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
		this.#unreadNotificationsFeed.forEach((notification) => {
			readNotifications.add(notification);
		});
		this.#unreadNotificationsCount.forEach((notification) => {
			readNotifications.add(notification);
		});
		this.#unreadNotificationsCount = new Set();
		this.#unreadNotificationsFeed = new Set();
		this.#saveReadNotifications(readNotifications);
	}

	static markMultipleAsRead(notifications) {
		const readNotifications = this.#getReadNotifications();
		notifications.forEach((notification) => {
			readNotifications.add(notification);
		});
		this.#saveReadNotifications(readNotifications);
	}

	static markMultipleAsUnread(notifications) {
		const readNotifications = this.#getReadNotifications();
		notifications.forEach((notification) => {
			readNotifications.delete(notification);
		});
		this.#saveReadNotifications(readNotifications);
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
