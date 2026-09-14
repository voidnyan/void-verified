import {IOption} from "../types/settings";
import {StaticSettings} from "../utils/staticSettings";

export class Version {
	versionNumber: string;
	featureList: Feature[];
	constructor(versionNumber: string, featureList: Feature[]) {
		this.versionNumber = versionNumber;
		this.featureList = featureList;
	}
}

 export class Feature {
	option: IOption;
	description: string;
	constructor(entry: string | IOption) {
		if (!(typeof entry === "string"))
			this.option = entry as IOption;
		else
			this.description = entry as string;
	}
}

export const changeLog = () => [
	new Version("2,4", [
		new Feature(StaticSettings.settingsInstance.options.openNotificationInOverlay)
	]),
	new Version("2.3", [
		new Feature("Allow saving configs for In Progress list activity settings."),
		new Feature("Removed replacing media list note tooltip with a dialog after AniList implemented this feature."),
		new Feature("Removed a fix where private messages where shown in profile activity feed with the List filter after AniList fixed this bug."),
		new Feature("Fixed not syncing notification read status between devices when clicking its link in some cases.")
	]),
	new Version("2.2", [
		new Feature(StaticSettings.settingsInstance.options.lighthouseCardEnabled),
		new Feature(StaticSettings.settingsInstance.options.lighthouseTabEnabled),
		new Feature(StaticSettings.settingsInstance.options.socialTabEnhancementEnabled),
		new Feature("Replace media list note tooltip with a dialog."),
		new Feature(StaticSettings.settingsInstance.options.verifyButtonInProfile),
		new Feature("Display media overview when hovering VoidVerified In Progress entries. Enable this in the Mini Media subcategory in VoidVerified settings."),
		new Feature("Added an option to create automatic categories for rewatching and rereading in In Progress settings."),
		new Feature("In Progress sections are now collapsible by clicking their header."),
		new Feature("Quick Access Users section is now collapsible by clicking the Users header."),
		new Feature("Fixed some cases where Media Overview failed to render due to data field not existing.")
	]),
	new Version("2.1", [
		new Feature("Change list activity settings from the in-progress section settings in home feed.")
	]),
	new Version("2.0", [
		new Feature(StaticSettings.settingsInstance.options.replaceInProgressEnabled),
		new Feature(StaticSettings.settingsInstance.options.aniListApiExponentialBackoff),
		new Feature("Replace notification dot on mobile navigation when using VV notifications feature"),
		new Feature("Improved image preview overlay."),
		new Feature("Added an input field to filter options in settings page."),
		new Feature("Removed the feature to display goals on user profile.")
	])
];
