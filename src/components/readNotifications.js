export class ReadNotifications {
	static #notificationsInLocalStorage = "void-verified-read-notifications";
	static #unreadNotifications = new Set();
	static getUnreadNotificationsCount(notifications) {
		const readNotifications = this.#getReadNotifications();
		let unreadNotificationsCount = 0;
		for (const notification of notifications) {
			if (!readNotifications.has(notification.id)) {
				unreadNotificationsCount++;
				this.#unreadNotifications.add(notification.id);
			}
		}
		return unreadNotificationsCount;
	}

	static markAsRead(notificationId) {
		const readNotifications = this.#getReadNotifications();
		readNotifications.add(notificationId);
		this.#unreadNotifications.delete(notificationId);
		this.#saveReadNotifications(readNotifications);
	}

	static markAllAsRead() {
		const readNotifications = this.#getReadNotifications();
		this.#unreadNotifications.forEach((notification) => {
			readNotifications.add(notification);
		});
		this.#unreadNotifications = new Set();
		this.#saveReadNotifications(readNotifications);
	}

	static markMultipleAsRead(notifications) {
		const readNotifications = this.#getReadNotifications();
		notifications.forEach((notification) => {
			readNotifications.add(notification);
		});
		this.#saveReadNotifications(readNotifications);
	}

	static isRead(notificationId) {
		const readNotifications = this.#getReadNotifications();
		const isRead = readNotifications.has(notificationId);
		if (!isRead) {
			this.#unreadNotifications.add(notificationId);
		}
		return isRead;
	}

	static #getReadNotifications() {
		return new Set(
			JSON.parse(localStorage.getItem(this.#notificationsInLocalStorage))
		);
	}

	static #saveReadNotifications(notifications) {
		let notificationsAsArray = Array.from(notifications);
		if (notificationsAsArray.length > 10000) {
			notificationsAsArray = notificationsAsArray.slice(-10000);
		}
		localStorage.setItem(
			this.#notificationsInLocalStorage,
			JSON.stringify(notificationsAsArray)
		);
	}
}
