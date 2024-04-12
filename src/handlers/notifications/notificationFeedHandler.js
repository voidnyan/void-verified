import { AnilistAPI } from "../../api/anilistAPI";
import { Button, Checkbox, SettingLabel } from "../../components/components";
import { Loader } from "../../components/loader";
import { NotificationWrapper } from "../../components/notificationWrapper";
import { DOM } from "../../utils/DOM";
import { Toaster } from "../../utils/toaster";
import { StyleHandler } from "../styleHandler";
import { NotificationConfig } from "./notificationConfig";
import { notificationTypes } from "./notificationTypes";

export class NotificationFeedHandler {
	#settings;
	#config;
	#filter = "custom";
	#pageInfo = {
		currentPage: 0,
		hasNextPage: false,
	};
	constructor(settings) {
		this.#settings = settings;
		this.#config = new NotificationConfig(
			"void-verified-notifications-config"
		);

		if (this.#settings.options.replaceNotifications.getValue()) {
			new StyleHandler().createStyleLink(
				notificationReplacementStyles,
				"notifications"
			);
		}
	}

	renderNotificationsFeed() {
		if (!this.#settings.options.replaceNotifications.getValue()) {
			return;
		}

		if (!window.location.pathname.startsWith("/notifications")) {
			return;
		}

		if (document.querySelector("#void-notifications-feed-container")) {
			return;
		}

		const container = DOM.create("div", "#notifications-feed-container");
		container.classList.add("container");
		container.append(this.#createSideBar());
		document
			.querySelector(".notifications-feed.container")
			.append(container);

		const notifications = DOM.create("div", "notifications-feed-list");
		container.append(notifications);

		this.#createNotifications();
	}

	#createSideBar() {
		const container = DOM.create("div", "notifications-feed-sidebar");
		container.append(this.#createFilters());
		container.append(this.#createUnreadButton());
		container.append(this.#createConfigurationContainer());
		return container;
	}

	#createFilters() {
		const container = DOM.create("div", "notifications-feed-filters");
		container.append(
			...filters.map((filter) => {
				const filterButton = DOM.create(
					"div",
					"notifications-feed-filter",
					filter
				);
				filterButton.setAttribute("void-filter", filter);
				if (filter === this.#filter) {
					filterButton.classList.add("void-active");
				}
				filterButton.addEventListener("click", () => {
					this.#filter = filter;
					document
						.querySelector(
							".void-notifications-feed-filter.void-active"
						)
						?.classList.remove("void-active");
					document
						.querySelector(
							`.void-notifications-feed-filter[void-filter="${filter}"]`
						)
						?.classList.add("void-active");
					this.#pageInfo = { currentPage: 0, hasNextPage: false };
					document
						.querySelector(".void-notifications-feed-list")
						.replaceChildren([]);
					this.#createNotifications();
				});
				return filterButton;
			})
		);
		return container;
	}

	#createUnreadButton = () => {
		const button = Button(
			"Mark all as read",
			() => {},
			"notification-all-read-button"
		);
		return button;
	};

	#createConfigurationContainer() {
		const container = DOM.create("div", "notifications-feed-settings");
		const header = DOM.create(
			"h2",
			"notification-settings-header",
			"Notification Settings"
		);

		const configWrapper = DOM.create("div", "notifications-config-wrapper");
		configWrapper.setAttribute("collapsed", "true");

		const basicOptions = this.#createbasicOptions();
		const notificationTypes = this.#createNotificationTypeOptions();
		configWrapper.append(basicOptions, notificationTypes);

		header.addEventListener("click", () => {
			configWrapper.setAttribute(
				"collapsed",
				!(configWrapper.getAttribute("collapsed") === "true")
			);
		});

		container.append(header, configWrapper);

		return container;
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
				})
			);
			container.append(t);
		}

		return container;
	};

	async #createNotifications() {
		this.#showLoader();
		document
			.querySelector(".void-notifications-load-more-button")
			?.remove();
		const notificationElements = [];
		let notifications = [];

		try {
			Toaster.debug("Querying notification feed.");
			const [notifs, pageInfo] = await new AnilistAPI(
				this.#settings
			).getNotifications(
				this.#getNotificationTypes(),
				this.#pageInfo.currentPage + 1
			);
			notifications = notifs;
			this.#pageInfo = pageInfo;
		} catch (error) {
			console.error(error);
			Toaster.error("There was an error querying notification feed.");
		}

		for (const notification of this.#groupNotifications(notifications)) {
			notificationElements.push(NotificationWrapper(notification));
		}

		if (notifications.length === 0) {
			notificationElements.push(
				DOM.create(
					"div",
					"notifications-feed-empty-notice",
					"Couldn't load notifications."
				)
			);
		}

		document.querySelector(".void-loader")?.remove();

		document
			.querySelector(".void-notifications-feed-list")
			.append(...notificationElements);

		this.#createLoadMoreButton();
	}

	#createLoadMoreButton() {
		if (!this.#pageInfo.hasNextPage) {
			return;
		}
		const button = Button(
			"Load More",
			() => {
				this.#createNotifications(this.#pageInfo.currentPage + 1);
			},
			"notifications-load-more-button"
		);
		document.querySelector(".void-notifications-feed-list").append(button);
	}

	#showLoader() {
		document
			.querySelector(".void-notifications-feed-list")
			.append(Loader());
	}

	#getNotificationTypes() {
		switch (this.#filter) {
			case "custom":
				return this.#config.notificationTypes;
			case "all":
				return notificationTypes;
			case "airing":
				return ["AIRING"];
			case "activity":
				return [
					"ACTIVITY_MENTION",
					"ACTIVITY_MESSAGE",
					"ACTIVITY_REPLY",
					"ACTIVITY_REPLY_SUBSCRIBED",
				];
			case "likes":
				return ["ACTIVITY_LIKE", "ACTIVITY_REPLY_LIKE"];
			case "forum":
				return [
					"THREAD_COMMENT_LIKE",
					"THREAD_COMMENT_MENTION",
					"THREAD_COMMENT_REPLY",
					"THREAD_LIKE",
					"THREAD_SUBSCRIBED",
				];
			case "follows":
				return ["FOLLOWING"];
			case "media":
				return [
					"RELATED_MEDIA_ADDITION",
					"MEDIA_DATA_CHANGE",
					"MEDIA_DELETION",
				];
		}
	}

	#groupNotifications(notifications) {
		if (!notifications) {
			return [];
		}

		if (
			!this.#config.groupNotifications ||
			!notifications ||
			notifications.length === 0
		) {
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
}

const filters = [
	"custom",
	"all",
	"airing",
	"activity",
	"forum",
	"follows",
	"likes",
	"media",
];

const notificationReplacementStyles = `
    .nav .user .notification-dot {
        display: none;
    }

    .notifications-feed.container .filters,
    .notifications-feed.container .notifications {
        display: none;
    }
`;
