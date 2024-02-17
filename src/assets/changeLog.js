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
	new Version("1.10", [
		new Feature(
			"added a change log to introduce new features",
			"changeLogEnabled"
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
