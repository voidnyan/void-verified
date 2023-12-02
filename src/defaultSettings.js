export const categories = {
	users: "users",
	paste: "paste",
	css: "css",
	misc: "misc",
};

export const defaultSettings = {
	copyColorFromProfile: {
		defaultValue: true,
		description: "Copy user color from their profile.",
		category: categories.users,
	},
	moveSubscribeButtons: {
		defaultValue: false,
		description:
			"Move activity subscribe button next to comments and likes.",
		category: categories.misc,
	},
	autoLikeOnSubscribe: {
		defaultValue: false,
		description: "Like activities when subscribing.",
		category: categories.misc,
	},
	hideLikeCount: {
		defaultValue: false,
		description: "Hide activity and reply like counts.",
		category: categories.misc,
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
		category: categories.css,
	},
	globalCssAutoDisable: {
		defaultValue: true,
		description: "Disable global CSS when a profile has custom CSS.",
		category: categories.css,
	},
	profileCssEnabled: {
		defaultValue: false,
		description: "Load user's custom CSS when viewing their profile.",
		category: categories.css,
		authRequired: true,
	},
	activityCssEnabled: {
		defaultValue: false,
		description:
			"Load user's custom CSS when viewing their activity (direct link).",
		category: categories.css,
		authRequired: true,
	},
	onlyLoadCssFromVerifiedUser: {
		defaultValue: false,
		description: "Only load custom CSS from verified users.",
		category: categories.css,
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
	// pasteRequireKeyPress: {
	// 	defaultValue: true,
	// 	description: "Require an additional key to be pressed while pasting.",
	// 	category: categories.paste,
	// },
	// pasteKeybind: {
	// 	defaultValue: "Shift",
	// 	description: "The key to be pressed while pasting.",
	// 	category: categories.paste,
	// },
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
};
