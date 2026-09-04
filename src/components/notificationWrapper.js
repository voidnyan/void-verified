import { DOM } from "../utils/DOM";
import {IconButton, Link} from "./components";
import { ReadNotifications } from "./readNotifications";
import {Time} from "../utils/time";
import {StaticTooltip} from "../utils/staticTooltip";
import {MiniProfileHandler} from "../handlers/miniProfileHandler";
import {ListBulletIcon} from "../assets/icons";
import {ActivityMode} from "../handlers/quickStart/modes/ActivityMode";
import {StaticSettings} from "../utils/staticSettings";

export const NotificationWrapper = (notification, addReadListener = false) => {
	const wrapper = DOM.create("div", "notification-wrapper");
	const previewWrapper = createPreview(notification);
	const context = createContext(notification, true);

	const timestamp = DOM.create(
		"div",
		"notification-timestamp",
		Time.convertToString(notification.createdAt),
	);

	StaticTooltip.register(timestamp, Time.toLocaleString(notification.createdAt));

	wrapper.append(previewWrapper, context, timestamp);
	if (addReadListener) {
		wrapper.addEventListener("click", async (e) => {
			if (wrapper.classList.contains("void-unread-notification")) {
				await markAsRead(notification);
				wrapper.classList.remove("void-unread-notification");
			} else {
				await markAsUnread(notification);
				wrapper.classList.add("void-unread-notification");
			}
		});
	}
	return wrapper;
};

const markAsRead = async (notification) => {
	try {
		const notifications = [
			notification.id,
		];
		if (notification.group) {
			notifications.push(...notification.group.map((item) => item.notificationId));
		}
		await ReadNotifications.markMultipleAsRead(notifications);
	} catch (error) {
		console.error(error);
	}
};

const markAsUnread = async (notification) => {
	const notifications = [
		notification.id,
		...notification.group?.map((item) => item.notificationId),
	];
	await ReadNotifications.markMultipleAsUnread(notifications);
};

const createPreview = (notification) => {
	const previewWrapper = DOM.create("div", "notification-preview-wrapper");
	if (notification.type === "MEDIA_DELETION") {
		return previewWrapper;
	}
	const linkUrl = notification.user
		? `/user/${notification.user.name}/`
		: `/${notification.media?.type.toLowerCase()}/${
				notification.media?.id
			}`;
	const preview = Link("", linkUrl, "", "notification-preview");
	if (notification.media) {
		preview.classList.add("void-notification-preview-media");
	}
	const imageUrl =
		notification.user?.avatar.large ?? notification.media?.coverImage.large;
	preview.style.backgroundImage = `url(${imageUrl})`;
	previewWrapper.append(preview);

	if (notification.group?.length > 0) {
		preview.setAttribute("data-count", `+${notification.group.length}`);
		const group = createGroup(notification);
		previewWrapper.append(group);
	}

	previewWrapper.addEventListener("click", (event) => {
		event.stopPropagation();
	});

	if (notification.activity) {
		previewWrapper.append(createActivityRelation(notification.activity));
	}

	return previewWrapper;
};

const createActivityRelation = (activity) => {
	let url;
	let image;
	switch (activity.type) {
		case "ANIME_LIST":
			url = `/anime/${activity.media.id}`;
			image = activity.media.coverImage.large;
			break;
		case "MANGA_LIST":
			url = `/manga/${activity.media.id}`;
			image = activity.media.coverImage.large;
			break;
		case "TEXT":
			url = `/user/${activity.user.name}`;
			image = activity.user.avatar.large;
			break;
		case "MESSAGE":
			url = `/user/${activity.recipient.name}`;
			image = activity.recipient.avatar.large;
			break;
	}
	const activityRelation = Link("", url, "", "notification-preview-relation");
	activityRelation.style.backgroundImage = `url(${image})`;
	return activityRelation;
};

const createGroup = (notification) => {
	const group = DOM.create("div", "notification-group");
	for (const user of notification.group.slice(
		0,
		Math.min(10, notification.group.length),
	)) {
		const groupItem = Link(
			"",
			`/user/${user.name}/`,
			"",
			"notification-group-item",
		);
		groupItem.style.backgroundImage = `url(${user.avatar.large})`;
		group.append(groupItem);
	}
	return group;
};

const createContext = (notification, addReadListener) => {
	if (
		notification.type === "AIRING" ||
		notification.type === "RELATED_MEDIA_ADDITION" ||
		notification.type === "MEDIA_DATA_CHANGE" ||
		notification.type === "MEDIA_DELETION"
	) {
		return createMediaContext(notification, addReadListener);
	}

	const highlight = DOM.create(
		"span",
		"notification-context-actor",
		notification.user.name,
	);

	if (MiniProfileHandler.config.hoverNotifications) {
		MiniProfileHandler.addUserHoverListener(highlight);
	}

	const context = DOM.create("a", "notification-context", [
		highlight,
		`\u00A0${notification.context.trim()}`,
	]);

	if (notification.activityId &&
		StaticSettings.options.openNotificationInOverlay.getValue() &&
		StaticSettings.options.quickStartEnabled.getValue()) {
		const activityButton = IconButton(ListBulletIcon(), async (event) => {
			event.stopPropagation();
			event.stopImmediatePropagation();
			event.preventDefault();
			await ActivityMode.openActivity(notification.activityId);
			await markAsRead(notification);
			context.parentElement.classList.remove("void-unread-notification");
		});
		context.append(activityButton);
	}

	if (notification.thread) {
		const thread = DOM.create(
			"span",
			"notification-context-actor",
			`\u00A0${notification.thread.title}`,
		);
		context.append(thread);
	}

	context.setAttribute("href", getNotificationUrl(notification));
	if (addReadListener) {
		context.addEventListener("click", async (event) => {
			event.stopPropagation();
			event.preventDefault();
			await markAsRead(notification);
			window.location.href = context.getAttribute("href");
		});
	}

	return context;
};

const getNotificationUrl = (notification) => {
	switch (notification.type) {
		case "THREAD_COMMENT_LIKE":
		case "THREAD_COMMENT_MENTION":
		case "THREAD_SUBSCRIBED":
		case "THREAD_COMMENT_REPLY":
			return `/forum/thread/${notification.thread.id}/comment/${notification.commentId}`;
		case "THREAD_LIKE":
			return `/forum/thread/${notification.threadId}/`;
		case "FOLLOWING":
			return `/user/${notification.user.name}/`;
		default:
			return `/activity/${notification.activityId}`;
	}
};

const createMediaContext = (notification, addReadListener) => {
	const highlight = DOM.create(
		"span",
		"notification-context-actor",
		notification.media?.title?.userPreferred ??
			notification.deletedMediaTitle,
	);
	let context;
	if (notification.type === "AIRING") {
		context = DOM.create("a", "notification-context", [
			notification.contexts[0],
			notification.episode,
			notification.contexts[1],
			highlight,
			notification.contexts[2],
		]);
	} else {
		context = DOM.create("a", "notification-context", [
			highlight,
			`\u00A0${notification.context.trim()}`,
		]);
	}
	if (!notification.deletedMediaTitle) {
		context.setAttribute(
			"href",
			`${notification.media.type.toLowerCase()}/${
				notification.media.id
			}`,
		);
	}

	if (notification.reason) {
		const reason = DOM.create(
			"div",
			"notification-context-reason",
			notification.reason,
		);
		context.append(reason);
	}
	if (addReadListener) {
		context.addEventListener("click", async (event) => {
			event.stopPropagation();
			event.preventDefault();
			await markAsRead(notification);
			if (!notification.deletedMediaTitle)
				window.location.href = context.getAttribute("href");
		});
	}
	return context;
};
