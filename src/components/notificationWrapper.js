import { DOM } from "../utils/DOM";
import { Link, Tooltip } from "./components";

export const NotificationWrapper = (notification) => {
	const wrapper = DOM.create("div", "notification-wrapper");
	const previewWrapper = createPreview(notification);
	const context = createContext(notification);

	const timestamp = DOM.create(
		"div",
		"notification-timestamp",
		timeAgo(notification.createdAt)
	);

	wrapper.append(previewWrapper, context, timestamp);
	return wrapper;
};

const createPreview = (notification) => {
	const previewWrapper = DOM.create("div", "notification-preview-wrapper");
	if (notification.type === "MEDIA_DELETION") {
		return previewWrapper;
	}
	const linkUrl = notification.user
		? `https://anilist.co/user/${notification.user.name}/`
		: `https://anilist.co/${notification.media?.type.toLowerCase()}/${
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

	return previewWrapper;
};

const createGroup = (notification) => {
	const group = DOM.create("div", "notification-group");
	for (const user of notification.group.slice(
		0,
		Math.min(10, notification.group.length)
	)) {
		const groupItem = Link(
			"",
			`https://anilist.co/user/${user.name}/`,
			"",
			"notification-group-item"
		);
		groupItem.style.backgroundImage = `url(${user.avatar.large})`;
		const tooltip = Tooltip(user.name, groupItem);
		group.append(tooltip);
	}
	return group;
};

const createContext = (notification) => {
	if (
		notification.type === "AIRING" ||
		notification.type === "RELATED_MEDIA_ADDITION" ||
		notification.type === "MEDIA_DATA_CHANGE" ||
		notification.type === "MEDIA_DELETION"
	) {
		return createMediaContext(notification);
	}

	const highlight = DOM.create(
		"span",
		"notification-context-actor",
		notification.user.name
	);

	const context = DOM.create("a", "notification-context", [
		highlight,
		`\u00A0${notification.context.trim()}`,
	]);

	if (notification.thread) {
		const thread = DOM.create(
			"span",
			"notification-context-actor",
			`\u00A0${notification.thread.title}`
		);
		context.append(thread);
	}

	context.setAttribute("href", getNotificationUrl(notification));

	return context;
};

const getNotificationUrl = (notification) => {
	switch (notification.type) {
		case "THREAD_COMMENT_LIKE":
		case "THREAD_COMMENT_MENTION":
		case "THREAD_SUBSCRIBED":
		case "THREAD_COMMENT_REPLY":
			return `https://anilist.co/forum/thread/${notification.thread.id}/comment/${notification.commentId}`;
		case "THREAD_LIKE":
			return `https://anilist.co/forum/thread/${notification.threadId}/`;
		default:
			return `https://anilist.co/activity/${notification.activityId}`;
	}
};

const createMediaContext = (notification) => {
	const highlight = DOM.create(
		"span",
		"notification-context-actor",
		notification.media?.title?.userPreferred ??
			notification.deletedMediaTitle
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
			`https://anilist.co/${notification.media.type.toLowerCase()}/${
				notification.media.id
			}`
		);
	}

	if (notification.reason) {
		const reason = DOM.create(
			"div",
			"notification-context-reason",
			notification.reason
		);
		context.append(reason);
	}
	return context;
};

const timeAgo = (timestamp) => {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - timestamp * 1000) / 1000);

	let interval = Math.floor(seconds / 31536000);
	if (interval > 1) {
		return interval + " years ago";
	} else if (interval === 1) {
		return "1 year ago";
	}

	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months ago";
	} else if (interval === 1) {
		return "1 month ago";
	}

	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days ago";
	} else if (interval === 1) {
		return "1 day ago";
	}

	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours ago";
	} else if (interval === 1) {
		return "1 hour ago";
	}

	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes ago";
	} else if (interval === 1) {
		return "1 minute ago";
	}

	return Math.floor(seconds) + " seconds ago";
};