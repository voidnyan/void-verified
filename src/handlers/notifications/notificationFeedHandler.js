import { AnilistAPI } from "../../api/anilistAPI";
import { Button, Checkbox, SettingLabel } from "../../components/components";
import { Loader } from "../../components/loader";
import { NotificationWrapper } from "../../components/notificationWrapper";
import { ReadNotifications } from "../../components/readNotifications";
import { DOM } from "../../utils/DOM";
import { Toaster } from "../../utils/toaster";
import { StyleHandler } from "../styleHandler";
import { NotificationConfig } from "./notificationConfig";
import { notificationTypes } from "./notificationTypes";
import { NotificationsCache } from "./notificationsCache";

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

		if (
			this.#settings.options.replaceNotifications.getValue() &&
			this.#settings.isAuthorized()
		) {
			new StyleHandler().createStyleLink(
				notificationReplacementStyles,
				"notifications"
			);
			this.#handleUnreadNotificationsCount(this);
			setInterval(() => {
				this.#handleUnreadNotificationsCount(this);
			}, 3 * 60 * 1000);
		}
	}

	renderNotificationsFeed() {
		if (
			!this.#settings.options.replaceNotifications.getValue() ||
			!this.#settings.isAuthorized()
		) {
			return;
		}

		if (!window.location.pathname.startsWith("/notifications")) {
			this.#pageInfo = { currentPage: 0, hasNextPage: false };
			this.#filter = "custom";
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

	async #handleUnreadNotificationsCount(notificationFeedHandler) {
		if (
			!this.#settings.options.replaceNotifications.getValue() ||
			!this.#settings.isAuthorized()
		) {
			return;
		}

		try {
			let [notifications] = await new AnilistAPI(
				notificationFeedHandler.#settings
			).getNotifications(
				notificationFeedHandler.#config.notificationTypes,
				1,
				this.#config.resetDefaultNotifications
			);

			const unreadNotificationsCount =
				ReadNotifications.getUnreadNotificationsCount(notifications);
			document
				.querySelector(".nav .user .void-notification-dot")
				?.remove();
			if (unreadNotificationsCount === 0) {
				return;
			}
			const notificationDot = DOM.create(
				"a",
				"notification-dot",
				unreadNotificationsCount
			);
			notificationDot.setAttribute(
				"href",
				"https://anilist.co/notifications"
			);

			document.querySelector(".nav .user")?.append(notificationDot);
		} catch (error) {
			console.error(error);
			Toaster.error("There was an error querying unread notifications");
		}
	}

	#createSideBar() {
		const container = DOM.create("div", "notifications-feed-sidebar");
		container.append(this.#createFilters());
		container.append(this.#createReadAllButton());
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
					ReadNotifications.resetUnreadNotificationsFeed();
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

	#createReadAllButton = () => {
		const button = Button(
			"Mark all as read",
			async () => {
				ReadNotifications.markAllAsRead();
				document
					.querySelectorAll(".void-unread-notification")
					.forEach((notification) => {
						notification.classList.remove(
							"void-unread-notification"
						);
					});
				document.querySelector(".void-notification-dot")?.remove();
				if (!this.#config.resetDefaultNotifications) {
					try {
						Toaster.debug("Resetting notification count.");
						await new AnilistAPI(
							this.#settings
						).resetNotificationCount();
						document.body
							.querySelector(".user .notification-dot")
							?.remove();
						Toaster.success("Notifications count reset.");
					} catch (error) {
						Toaster.error(
							"There was an error resetting notification count."
						);
						console.error(error);
					}
				}
			},
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
		const relationOption = SettingLabel(
			"Add relation to activity notifications.",
			Checkbox(this.#config.addActivityRelation, () => {
				this.#config.addActivityRelation =
					!this.#config.addActivityRelation;
				this.#config.save();
			})
		);
		const resetOption = SettingLabel(
			"Reset AniList's notification count when querying notifications.",
			Checkbox(this.#config.resetDefaultNotifications, () => {
				this.#config.resetDefaultNotifications =
					!this.#config.resetDefaultNotifications;
				this.#config.save();
			})
		);
		container.append(groupOption, relationOption, resetOption);
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

		const anilistAPI = new AnilistAPI(this.#settings);

		try {
			Toaster.debug("Querying notification feed.");
			const [notifs, pageInfo] = await anilistAPI.getNotifications(
				this.#getNotificationTypes(),
				this.#pageInfo.currentPage + 1,
				this.#config.resetDefaultNotifications
			);
			notifications = notifs;
			this.#pageInfo = pageInfo;
		} catch (error) {
			console.error(error);
			Toaster.error("There was an error querying notification feed.");
		}

		const activityIds = new Set(
			notifications
				.filter((x) => x.activityId)
				.filter((x) => x.type !== "ACTIVITY_MESSAGE")
				.map((x) => x.activityId)
		);

		if (activityIds.size > 0 && this.#config.addActivityRelation) {
			const [relations, missingIds] =
				NotificationsCache.getCachedRelations(Array.from(activityIds));
			const nonDeadIds = NotificationsCache.filterDeadLinks(missingIds);
			if (nonDeadIds.length > 0) {
				try {
					const rels =
						await anilistAPI.getActivityNotificationRelations(
							Array.from(nonDeadIds)
						);
					relations.push(...rels);
					NotificationsCache.cacheRelations(rels);
					const foundIds = rels.map((relation) => relation.id);
					NotificationsCache.cacheDeadLinks(
						missingIds.filter((id) => !foundIds.includes(id))
					);
				} catch (error) {
					console.error(error);
					Toaster.error(
						"Failed to get activity notification relations."
					);
				}
			}
			notifications = notifications.map((notification) => {
				notification.activity = relations.find(
					(relation) => notification.activityId === relation.id
				);
				return notification;
			});
		}

		for (const notification of this.#groupNotifications(notifications)) {
			const notificationElement = NotificationWrapper(notification, true);
			if (!ReadNotifications.isRead(notification.id)) {
				notificationElement.classList.add("void-unread-notification");
			}
			notificationElements.push(notificationElement);
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
				const groupItem = {
					...notification.user,
					notificationId: notification.id,
				};
				prevNotification.group.push(groupItem);
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
