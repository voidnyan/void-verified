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
	new Version("1.13", [
		new Feature(
			"Replace AniList notification system.",
			"replaceNotifications"
		),
		new Feature(
			"Display quick access of notifications in home page.",
			"quickAccessNotificationsEnabled"
		),
	]),
	new Version("1.12", [
		new Feature("Enable CSSpy in Layout & CSS tab.", "csspyEnabled"),
	]),
	new Version("1.11", [
		new Feature(
			"Fix AniList bug where private messages are displayed in List activity feed.",
			"hideMessagesFromListFeed"
		),
		new Feature(
			"Fix layout designer preview crashing the script when viewing a tab other than overview."
		),
		new Feature(
			"Fix a bug where disabling layout preview would change another user's layout."
		),
	]),
	new Version("1.10", [
		new Feature(
			"added a change log to introduce new features",
			"changeLogEnabled"
		),
		new Feature(
			"added a self-message button to user's own profile",
			"selfMessageEnabled"
		),
		new Feature("color coded Layout Designer and CSS action buttons"),
		new Feature(
			"fixed a bug where an API error when publishing CSS could lead to user's about being removed"
		),
	]),
	new Version("1.9", [
		new Feature(
			"added gif keyboard to save gifs/images for later use",
			"gifKeyboardEnabled"
		),
		new Feature(
			"open AniList links in the same tab",
			"removeAnilistBlanks"
		),
		new Feature("have multiple layouts in storage"),
		new Feature("secret field to hide API keys"),
	]),
	new Version("1.8", [
		new Feature("added toast notifications", "toasterEnabled"),
		new Feature(
			"added a timer until next refresh to Quick Access",
			"quickAccessTimer"
		),
		new Feature("added a refresh button to Quick Access"),
		new Feature("added Catbox.moe integration"),
		new Feature("fixed an error when publishing custom CSS or about"),
	]),
	new Version("1.7", [
		new Feature("added a Layout Designer", "layoutDesignerEnabled"),
	]),
];
