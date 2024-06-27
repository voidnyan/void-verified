export interface ISettings {
	options: IOptions;
	version: string;
	auth: {};
	anilistUser: string;
	isAuthorized: () => boolean;
}

export interface IOption {
	value?: string | number | boolean;
	defaultValue: string | number | boolean;
	description: string;
	category: string;
	authRequired: boolean;
	getValue: () => string | number | boolean;
}

export interface IOptions {
	copyColorFromProfile: IOption;
	moveSubscribeButtons: IOption;
	hideLikeCount: IOption;
	enabledForUsername: IOption;
	enabledForProfileName: IOption;
	defaultSign: IOption;
	highlightEnabled: IOption;
	highlightEnabledForReplies: IOption;
	highlightSize: IOption;
	colorUserActivity: IOption;
	colorUserReplies: IOption;
	useDefaultHighlightColor: IOption;
	defaultHighlightColor: IOption;
	globalCssEnabled: IOption;
	globalCssAutoDisable: IOption;
	profileCssEnabled: IOption;
	activityCssEnabled: IOption;
	onlyLoadCssFromVerifiedUser: IOption;
	layoutDesignerEnabled: IOption;
	quickAccessNotificationsEnabled: IOption;
	quickAccessEnabled: IOption;
	quickAccessBadge: IOption;
	quickAccessTimer: IOption;
	pasteEnabled: IOption;
	pasteWrapImagesWithLink: IOption;
	pasteImageWidth: IOption;
	pasteImagesToHostService: IOption;
	toasterEnabled: IOption;
	removeAnilistBlanks: IOption;
	gifKeyboardEnabled: IOption;
	gifKeyboardLikeButtonsEnabled: IOption;
	changeLogEnabled: IOption;
	selfMessageEnabled: IOption;
	hideMessagesFromListFeed: IOption;
	csspyEnabled: IOption;
	replyActivityUpdate: IOption;
	markdownHotkeys: IOption
	// useElevatedFetch: IOption;
}
