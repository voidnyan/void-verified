export interface ISettings {
	options: IOptions;
	version: string;
	auth: {};
	anilistUser: string;
	userId?: number;
	isAuthorized: () => boolean;
	verifiedUsers: IVerifiedUser[];
	saveSettingToLocalStorage: (key: string, value: string | boolean) => void;
}

export interface IVerifiedUser {
	avatar: string,
	banner: string,
	color: string,
	id: number,
	lastFetch: string | Date,
	quickAccessBadgeDisplay: boolean,
	sign: string,
	username: string,
	quickAccessBadge: boolean,
	enabledForUsername: boolean,
	copyColorFromProfile: boolean,
	highlightEnabled: boolean,
	highlightEnabledForReplies: boolean,
	colorUserActivity: boolean,
	colorUserReplies: boolean,
	quickAccessEnabled: boolean,
}

export interface IOption {
	key?: string;
	value?: string | number | boolean;
	defaultValue: string | number | boolean;
	description: string;
	category: string;
	authRequired?: boolean;
	getValue?: () => string | number | boolean;
	setValue?: (value: string | number | boolean) => void;
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
	layoutDesignerEnabled: IOption;
	quickAccessNotificationsEnabled: IOption;
	quickAccessEnabled: IOption;
	quickAccessBadge: IOption;
	quickAccessTimer: IOption;
	pasteEnabled: IOption;
	pasteWrapImagesWithLink: IOption;
	pasteImageWidthValue: IOption;
	pasteImageUnitIsPercentage: IOption;
	pasteImagesToHostService: IOption;
	toasterEnabled: IOption;
	removeAnilistBlanks: IOption;
	gifKeyboardEnabled: IOption;
	gifKeyboardLikeButtonsEnabled: IOption;
	changeLogEnabled: IOption;
	selfMessageEnabled: IOption;
	hideMessagesFromListFeed: IOption;
	replyActivityUpdate: IOption;
	markdownHotkeys: IOption;
	collapsibleReplies: IOption;
	rememberCollapsedReplies: IOption;
	autoCollapseLiked: IOption;
	autoCollapseSelf: IOption;
	goalsEnabled: IOption;
	imagePreviewEnabled: IOption;
	miniProfileEnabled: IOption;
	replaceNotifications: IOption;
	replaceVideosWithLinksEnabled: IOption;
	messageFeedEnabled: IOption;
	quickStartEnabled: IOption;
	activityTimestampTooltipsEnabled: IOption;
	replyToEnabled: IOption;
	replyDirectLinksEnabled: IOption;
	scrollToReplyEnabled: IOption;
	markdownTaskbarEnabled: IOption;
}
