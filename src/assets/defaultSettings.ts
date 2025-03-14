import {IOptions} from "../types/settings";

export const categories = {
	users: "users",
	paste: "paste",
	activity: "activity",
	misc: "misc",
};

export const defaultSettings: IOptions = {
	copyColorFromProfile: {
		defaultValue: true,
		description: "Copy user color from their profile.",
		category: categories.users,
	},
	moveSubscribeButtons: {
		defaultValue: false,
		description:
			"Move activity subscribe button next to comments and likes.",
		category: categories.activity,
	},
	hideLikeCount: {
		defaultValue: false,
		description: "Hide activity and reply like counts.",
		category: categories.activity,
	},
	enabledForUsername: {
		defaultValue: true,
		description: "Display a verified sign next to usernames.",
		category: categories.users,
	},
	enabledForProfileName: {
		defaultValue: false,
		description: "Display a verified sign next to a profile name.",
		category: categories.users,
	},
	defaultSign: {
		defaultValue: "✔",
		description: "The default sign displayed next to a username.",
		category: categories.users,
	},
	highlightEnabled: {
		defaultValue: true,
		description: "Highlight user activity with a border.",
		category: categories.users,
	},
	highlightEnabledForReplies: {
		defaultValue: true,
		description: "Highlight replies with a border.",
		category: categories.users,
	},
	highlightSize: {
		defaultValue: "5px",
		description: "Width of the highlight border.",
		category: categories.users,
	},
	colorUserActivity: {
		defaultValue: false,
		description: "Color user activity links with user color.",
		category: categories.users,
	},
	colorUserReplies: {
		defaultValue: false,
		description: "Color user reply links with user color.",
		category: categories.users,
	},
	useDefaultHighlightColor: {
		defaultValue: false,
		description:
			"Use fallback highlight color when user color is not specified.",
		category: categories.users,
	},
	defaultHighlightColor: {
		defaultValue: "#FFFFFF",
		description: "Fallback highlight color.",
		category: categories.users,
	},
	globalCssEnabled: {
		defaultValue: false,
		description: "Enable custom global CSS.",
		category: categories.misc,
	},
	layoutDesignerEnabled: {
		defaultValue: false,
		description: "Enable Layout Designer in the settings tab.",
		category: categories.misc,
		authRequired: true,
	},
	replaceNotifications: {
		defaultValue: false,
		description: "Replace AniList notification system.",
		category: categories.misc,
		authRequired: true,
	},
	quickAccessNotificationsEnabled: {
		defaultValue: false,
		description: "Display quick access of notifications in home page.",
		category: categories.misc,
		authRequired: true,
	},
	quickAccessEnabled: {
		defaultValue: false,
		description: "Display quick access of users in home page.",
		category: categories.users,
	},
	quickAccessBadge: {
		defaultValue: false,
		description:
			"Display a badge on quick access when changes are detected on user's layout.",
		category: categories.users,
	},
	quickAccessTimer: {
		defaultValue: true,
		description: "Display a timer until next update of Quick Access.",
		category: categories.users,
	},
	pasteEnabled: {
		defaultValue: false,
		description:
			"Automatically wrap pasted links and images with link and image tags.",
		category: categories.paste,
	},
	pasteWrapImagesWithLink: {
		defaultValue: false,
		description: "Wrap images with a link tag.",
		category: categories.paste,
	},
	pasteImageWidth: {
		defaultValue: "420",
		description: "Width used when pasting images.",
		category: categories.paste,
	},
	pasteImagesToHostService: {
		defaultValue: false,
		description:
			"Upload image from the clipboard to image host (configure below).",
		category: categories.paste,
	},
	toasterEnabled: {
		defaultValue: true,
		description: "Enable toast notifications.",
		category: categories.misc,
	},
	// useElevatedFetch: {
	// 	defaultValue: false,
	// 	description:
	// 		"Query AniList API with elevated browser access (this might solve some API issues).",
	// 	category: categories.misc,
	// },
	removeAnilistBlanks: {
		defaultValue: false,
		description: "Open AniList links in the same tab.",
		category: categories.misc,
	},
	gifKeyboardEnabled: {
		defaultValue: false,
		description: "Add a GIF keyboard to activity editor.",
		category: categories.paste,
	},
	gifKeyboardLikeButtonsEnabled: {
		defaultValue: true,
		description: "Add like buttons to add media to GIF keyboard.",
		category: categories.paste,
	},
	changeLogEnabled: {
		defaultValue: true,
		description: "Display a changelog when a new version is detected.",
		category: categories.misc,
	},
	selfMessageEnabled: {
		defaultValue: false,
		description:
			"Enable a self-message button on your profile (requires authentication).",
		category: categories.activity,
		authRequired: true,
	},
	hideMessagesFromListFeed: {
		defaultValue: false,
		description:
			"Fix AniList bug where private messages are displayed in List activity feed.",
		category: categories.activity,
	},
	replyActivityUpdate: {
		defaultValue: false,
		description: "Add insta-reply to activity update in home feed.",
		category: categories.activity,
		authRequired: true,
	},
	markdownHotkeys: {
		defaultValue: false,
		description: "Enable markdown editor shortcuts.",
		category: categories.activity,
		authRequired: false,
	},
	collapsibleReplies: {
		defaultValue: false,
		description: "Add collapse button to replies.",
		category: categories.activity,
		authRequired: false,
	},
	autoCollapseLiked: {
		defaultValue: false,
		description: "Collapse liked comments.",
		category: categories.activity,
		authRequired: false,
	},
	autoCollapseSelf: {
		defaultValue: false,
		description: "Collapse your own replies.",
		category: categories.activity,
		authRequired: false,
	},
	goalsEnabled: {
		defaultValue: false,
		description: "Display animanga goals in profile overview.",
		category: categories.misc,
		authRequired: true,
	},
	imagePreviewEnabled: {
		defaultValue: false,
		description: "Hover image links to preview.",
		category: categories.activity,
		authRequired: false
	},
	miniProfileEnabled: {
		defaultValue: false,
		description: "Hover over users to view a mini profile.",
		category: categories.users,
		authRequired: false
	},
	fixVideoTypes: {
		defaultValue: false,
		description: "Detect video mime types based on file extension in url (mobile fix).",
		category: categories.misc,
		authRequired: false
	},
	messageFeedEnabled: {
		defaultValue: false,
		description: "Enable Message-feed in the home page.",
		category: categories.activity,
		authRequired: true
	},
	quickStartEnabled: {
		defaultValue: false,
		description: "Enable VoidVerified QuickStart.",
		category: categories.misc,
		authRequired: true
	},
	activityTimestampTooltipsEnabled: {
		defaultValue: false,
		description: "Replace activity timestamp tooltips.",
		category: categories.misc,
		authRequired: false
	}
};
