export const defaultSettings = {
	copyColorFromProfile: {
		defaultValue: true,
		description: "Copy user color from their profile.",
	},
	moveSubscribeButtons: {
		defaultValue: false,
		description:
			"Move activity subscribe button next to comments and likes.",
	},
	hideLikeCount: {
		defaultValue: false,
		description: "Hide activity and reply like counts.",
	},
	enabledForUsername: {
		defaultValue: true,
		description: "Display a verified sign next to usernames.",
	},
	enabledForProfileName: {
		defaultValue: false,
		description: "Display a verified sign next to a profile name.",
	},
	defaultSign: {
		defaultValue: "✔",
		description: "The default sign displayed next to a username.",
	},
	highlightEnabled: {
		defaultValue: true,
		description: "Highlight user activity with a border.",
	},
	highlightEnabledForReplies: {
		defaultValue: true,
		description: "Highlight replies with a border.",
	},
	highlightSize: {
		defaultValue: "5px",
		description: "Width of the highlight border.",
	},
	useDefaultHighlightColor: {
		defaultValue: false,
		description:
			"Use fallback highlight color when user color is not specified.",
	},
	defaultHighlightColor: {
		defaultValue: "#FFFFFF",
		description: "Fallback highlight color.",
	},
	globalCssEnabled: {
		defaultValue: false,
		description: "Enable custom global CSS.",
	},
	globalCssAutoDisable: {
		defaultValue: true,
		description: "Disable global CSS when a profile has custom CSS.",
	},
	quickAccessEnabled: {
		defaultValue: false,
		description: "Display quick access of users in home page.",
	},
	pasteEnabled: {
		defaultValue: false,
		description:
			"Automatically wrap pasted links and images with link and image tags.",
	},
	pasteWrapImagesWithLink: {
		defaultValue: false,
		description: "Wrap images with a link tag.",
	},
	pasteRequireKeyPress: {
		defaultValue: true,
		description: "Require an additional key to be pressed while pasting.",
	},
	pasteKeybind: {
		defaultValue: "Shift",
		description: "The key to be pressed while pasting.",
	},
	pasteImageWidth: {
		defaultValue: "420",
		description: "Width used when pasting images.",
	},
};
