import { AnilistAPI } from "../../api/anilistAPI";
import { CheckBadgeIcon, CogIcon } from "../../assets/icons";
import {
	Checkbox,
	IconButton,
	SettingLabel,
} from "../../components/components";
import { NotificationWrapper } from "../../components/notificationWrapper";
import { ReadNotifications } from "../../components/readNotifications";
import { DOM } from "../../utils/DOM";
import { Toaster } from "../../utils/toaster";
import { NotificationConfig } from "./notificationConfig";
import { notificationTypes } from "./notificationTypes";

export class NotificationQuickAccessHandler {
	#settings;
	#shouldQuery = true;
	#shouldRender = true;
	#notifications;
	#timeout = null;
	#config;
	#configOpen = false;
	#shouldQueryAfterConfigClose = false;
	constructor(settings) {
		this.#settings = settings;
		this.#config = new NotificationConfig(
			"void-verified-quick-access-notifications-config"
		);
	}

	async renderNotifications() {
		if (
			!this.#settings.options.quickAccessNotificationsEnabled.getValue() ||
			!this.#settings.isAuthorized()
		) {
			return;
		}
		if (this.#shouldQuery) {
			await this.#queryNotifications();
		}

		if (!this.#shouldRender) {
			return;
		}

		if (this.#config.hideDefaultNotificationDot) {
			const dot = document.body.querySelector(".user .notification-dot");
			if (dot) {
				dot.style.display = "none";
			}
		}

		if (!this.#notifications) {
			return;
		}

		const quickAccessContainer = DOM.getOrCreate(
			"div",
			"#quick-access quick-access"
		);

		const container = DOM.create("div", "quick-access-notifications");

		if (!this.#configOpen) {
			const notifications = DOM.create("div", "notifications-list");
			for (const notification of this.#handleNotifications(
				this.#notifications
			)) {
				notifications.append(NotificationWrapper(notification));
			}
			container.append(notifications);
		} else {
			const configurationContainer = this.#createConfigurationContainer();
			container.append(configurationContainer);
		}

		const containerWrapper = DOM.create(
			"div",
			"quick-access-notifications-wrapper"
		);

		const header = DOM.create("h2", null, ["Notifications"]);
		container.setAttribute("collapsed", this.#config.collapsed);
		header.addEventListener("click", () => {
			this.#config.collapsed = !this.#config.collapsed;
			this.#config.save();
			container.setAttribute("collapsed", this.#config.collapsed);
		});

		const headerWrapper = DOM.create("div", null, header);
		headerWrapper.classList.add("section-header");

		const clearButton = this.#clearButton();
		const configButton = this.#configOpenButton();
		headerWrapper.append(
			DOM.create("span", null, [clearButton, configButton])
		);

		containerWrapper.append(headerWrapper, container);

		this.#insertIntoDOM(quickAccessContainer, containerWrapper);
	}

	resetShouldRender() {
		this.#shouldRender = true;
		this.#shouldQuery = true;
		clearTimeout(this.#timeout);
		this.#timeout = null;
	}

	async #queryNotifications() {
		this.#shouldQuery = false;
		this.#timeout = setTimeout(() => {
			this.#shouldQuery = true;
		}, 3 * 60 * 1000);
		try {
			const [notifications] = await new AnilistAPI(
				this.#settings
			).getNotifications(
				this.#config.notificationTypes.length > 0
					? this.#config.notificationTypes
					: notificationTypes
			);
			this.#notifications = notifications;
			this.#shouldRender = true;
		} catch (error) {
			console.error(error);
			Toaster.error(
				"There was an error querying quick access notifications."
			);
		}
	}

	#handleNotifications(notifications) {
		if (!notifications) {
			return [];
		}
		if (!this.#config.groupNotifications || notifications.length === 0) {
			return notifications.map((notification) => {
				notification.group = undefined;
				return notification;
			});
		}

		let prevNotification = notifications[0];
		prevNotification.group = [];
		let notificationsCopy = [...notifications];
		const notificationsToRemove = [];
		for (let i = 1; i < notifications.length; i++) {
			const notification = notifications[i];
			notification.group = [];
			if (
				prevNotification.type === notification.type &&
				prevNotification.activityId === notification.activityId &&
				notification.user
			) {
				prevNotification.group.push(notification.user);
				notificationsToRemove.push(i);
			} else {
				prevNotification = { ...notification };
			}
		}
		return notificationsCopy.filter(
			(_, index) => !notificationsToRemove.includes(index)
		);
	}

	#clearButton = () => {
		const clearButton = IconButton(CheckBadgeIcon(), async () => {
			if (this.#settings.options.replaceNotifications.getValue()) {
				ReadNotifications.markAllAsRead();
				document.querySelector(".void-notification-dot")?.remove();
			}
			try {
				await new AnilistAPI(this.#settings).resetNotificationCount();
				document.body
					.querySelector(".user .notification-dot")
					?.remove();
			} catch (error) {
				Toaster.error(
					"There was an error resetting notification count."
				);
				console.error(error);
			}
		});
		clearButton.setAttribute("title", "Mark all as read");
		return clearButton;
	};

	#configOpenButton = () => {
		const openConfigurationButton = IconButton(CogIcon(), () => {
			this.#configOpen = !this.#configOpen;
			this.#shouldRender = true;
			if (this.#shouldQueryAfterConfigClose) {
				this.#shouldQuery = true;
				this.#shouldQueryAfterConfigClose = false;
			}
			this.renderNotifications();
		});
		return openConfigurationButton;
	};

	#createConfigurationContainer() {
		const configWrapper = DOM.create("div", "notifications-config-wrapper");
		const header = DOM.create(
			"h2",
			"notification-settings-header",
			"Notification Settings"
		);

		const basicOptions = this.#createbasicOptions();
		const notificationTypes = this.#createNotificationTypeOptions();
		configWrapper.append(header, basicOptions, notificationTypes);

		return configWrapper;
	}

	#createbasicOptions = () => {
		const container = DOM.create("div");
		const groupOption = SettingLabel(
			"Group similar notifications.",
			Checkbox(this.#config.groupNotifications, () => {
				this.#config.groupNotifications =
					!this.#config.groupNotifications;
				this.#config.save();
			})
		);
		container.append(groupOption);
		return container;
	};

	#createNotificationTypeOptions = () => {
		const container = DOM.create("div");
		const header = DOM.create(
			"h3",
			"notification-type-list-header",
			"Notification Types"
		);
		container.append(header);

		for (const type of notificationTypes) {
			const t = SettingLabel(
				type,
				Checkbox(this.#config.notificationTypes.includes(type), () => {
					if (this.#config.notificationTypes.includes(type)) {
						this.#config.notificationTypes =
							this.#config.notificationTypes.filter(
								(x) => x !== type
							);
					} else {
						this.#config.notificationTypes.push(type);
					}
					this.#config.save();
					this.#shouldQueryAfterConfigClose = true;
				})
			);
			container.append(t);
		}

		return container;
	};

	#insertIntoDOM(quickAccessContainer, container) {
		if (
			quickAccessContainer.querySelector(
				".void-quick-access-notifications"
			)
		) {
			const oldNotifications = DOM.get(
				"quick-access-notifications-wrapper"
			);
			quickAccessContainer.replaceChild(container, oldNotifications);
		} else {
			quickAccessContainer.append(container);
		}
		this.#shouldRender = false;

		if (DOM.get("#quick-access")) {
			return;
		}
		const section = document.querySelector(
			".container > .home > div:nth-child(2)"
		);
		section.insertBefore(quickAccessContainer, section.firstChild);
	}
}
