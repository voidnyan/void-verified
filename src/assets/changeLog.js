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
	new Version("2.0", [
		new Feature("Replace In Progress sections in home feed.", "replaceInProgressEnabled"),
		new Feature("Temporarily pause AniList requests after repeated errors.", "aniListApiExponentialBackoff"),
		new Feature("Replace notification dot on mobile navigation when using VV notifications feature"),
		new Feature("Improved image preview overlay.")
	]),
	new Version("1.27", [
		new Feature("Sync read notifications with your other devices through VoidAPI.", "syncReadNotifications"),
		new Feature("Only query unread notifications count once between multiple tabs."),
		new Feature("Fix marking a notification as unread when clicking its link."),
		new Feature("Increase cache time of Quick Access Users to 24 hours."),
		new Feature("Increase cache time of Mini Profile to a week."),
		new Feature("Increase cache time of Media Overview to a month.")
	]),
	new Version("1.26", [
		new Feature("Hover over media to view an overview.", "miniMediaEnabled")
	]),
	new Version("1.25", [
		new Feature("Sync GIFs and images with your other devices through VoidAPI (requires VoidVerified API authorization)", "syncGifsToVoidApi")
	]),
	new Version("1.24", [
		new Feature("Create and vote on polls (requires VoidVerified API authorization).", "pollsEnabled"),
		new Feature("Add a taskbar to markdown editors.", "markdownTaskbarEnabled")
	]),
	new Version("1.23", [
		new Feature("Add Reply To selection to activities and replies.", "replyToEnabled"),
		new Feature("Add direct links to replies.", "replyDirectLinksEnabled"),
		new Feature("Scroll to reply if it is specified in the URL.", "scrollToReplyEnabled"),
		new Feature("Remember collapsed replies.", "rememberCollapsedReplies"),
	]),
	new Version("1.22", [
		new Feature("Replace videos with video links (mobile fix).", "replaceVideosWithLinksEnabled"),
		new Feature("Added a reload button to quick access notifications."),
		new Feature("Fixed VV adding a gap to end of page.")
	]),
	new Version("1.21", [
		new Feature("Enable VoidVerified QuickStart.", "quickStartEnabled"),
		new Feature("QuickStart can be opened by default with ctrl + space, or by clicking the console icon in navigation."),
		new Feature("Search activities, access notifications and verified users, change VV settings and quickly navigate to Anilist pages."),
		new Feature("Enable Message-feed in the home page.", "messageFeedEnabled"),
		new Feature("Added user bio to mini profile."),
		new Feature("Replace activity timestamp tooltips.", "activityTimestampTooltipsEnabled"),
		new Feature("Export and Import VV configurations in settings."),

	]),
	new Version("1.20", [
		new Feature("Hover over users to view a mini profile.", "miniProfileEnabled")
	]),
];
