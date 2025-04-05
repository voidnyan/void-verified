class Version {
	versionNumber;
	featureList;
	constructor(versionNumber, featureList) {
		this.versionNumber = versionNumber ?? "";
		this.featureList = featureList ?? [];
	}
}

class Feature {
	description;
	option;
	constructor(description, option) {
		this.description = description ?? "";
		this.option = option ?? undefined;
	}
}

export const changeLog = [
	new Version("1.21", [
		new Feature("Enable VoidVerified QuickStart.", "quickStartEnabled"),
		new Feature("QuickStart can be opened by default with ctrl + space, or by clicking the console icon in navigation."),
		new Feature("Search activities, access notifications and verified users, change VV settings and quickly navigate to Anilist pages."),
		new Feature("Enable Message-feed in the home page.", "messageFeedEnabled"),
		new Feature("Added user bio to mini profile."),
		new Feature("Detect video mime types based on file extension in url.", "fixVideoTypes"),
		new Feature("Replace activity timestamp tooltips.", "activityTimestampTooltipsEnabled"),
		new Feature("Export and Import VV configurations in settings."),

	]),
	new Version("1.20", [
		new Feature("Hover over users to view a mini profile.", "miniProfileEnabled")
	]),
	new Version("1.19", [
		new Feature("Display animanga goals in profile overview.", "goalsEnabled"),
		new Feature("Hover image links to preview.", "imagePreviewEnabled")
	]),
	new Version("1.18", [
		new Feature("Removed support for user CSS.")
	]),
	new Version("1.17", [
		new Feature("Add collapse button to replies.", "collapsibleReplies"),
		new Feature("Collapse liked comments.", "autoCollapseLiked"),
		new Feature("Collapse your own replies.", "autoCollapseSelf"),
		new Feature("Fixed not being able to drag text to input fields because of image drag and drop feature.")
	]),
	new Version("1.16", [
		new Feature("Cache user CSS.")
	]),
	new Version("1.15", [
		new Feature("Added shortcuts to markdown editors.",
			"markdownHotkeys"),
		new Feature("Fix inserting clipboard multiple times in some cases."),
		new Feature("Pasting images to code editor doesn't wrap them in image tags."),
		new Feature("Enabled Find/Replace feature in CSS editors."),
		new Feature("Drag and drop images to upload them to image host.")
	]),
	new Version("1.14", [
		new Feature(
			"Add insta-reply to activity update in home feed.",
			"replyActivityUpdate",
		),
		new Feature("Replace CSS text fields with code editors.")
	]),
	new Version("1.13", [
		new Feature(
			"Replace AniList notification system.",
			"replaceNotifications",
		),
		new Feature(
			"Display quick access of notifications in home page.",
			"quickAccessNotificationsEnabled",
		),
		new Feature(
			"Fixed a bug where pasting text with line breaks inserted extra line breaks.",
		),
		new Feature(
			"Fixed a layout designer bug where a GIF did not loop correctly while previewing.",
		),
	]),
	new Version("1.12", [
		new Feature("Enable CSSpy in Layout & CSS tab."),
	]),
	new Version("1.11", [
		new Feature(
			"Fix AniList bug where private messages are displayed in List activity feed.",
			"hideMessagesFromListFeed",
		),
		new Feature(
			"Fix layout designer preview crashing the script when viewing a tab other than overview.",
		),
		new Feature(
			"Fix a bug where disabling layout preview would change another user's layout.",
		),
	]),
	new Version("1.10", [
		new Feature(
			"added a change log to introduce new features",
			"changeLogEnabled",
		),
		new Feature(
			"added a self-message button to user's own profile",
			"selfMessageEnabled",
		),
		new Feature("color coded Layout Designer and CSS action buttons"),
		new Feature(
			"fixed a bug where an API error when publishing CSS could lead to user's about being removed",
		),
	]),
	new Version("1.9", [
		new Feature(
			"added gif keyboard to save gifs/images for later use",
			"gifKeyboardEnabled",
		),
		new Feature(
			"open AniList links in the same tab",
			"removeAnilistBlanks",
		),
		new Feature("have multiple layouts in storage"),
		new Feature("secret field to hide API keys"),
	]),
	new Version("1.8", [
		new Feature("added toast notifications", "toasterEnabled"),
		new Feature(
			"added a timer until next refresh to Quick Access",
			"quickAccessTimer",
		),
		new Feature("added a refresh button to Quick Access"),
		new Feature("added Catbox.moe integration"),
		new Feature("fixed an error when publishing custom CSS or about"),
	]),
	new Version("1.7", [
		new Feature("added a Layout Designer", "layoutDesignerEnabled"),
	]),
];
