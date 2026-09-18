import { GlobalCSS } from "./globalCSS";
import { ActivityHandler } from "./activityHandler";
import { StyleHandler } from "./styleHandler.js";
import { QuickAccess } from "./quickAccessHandler.js";
import { LayoutDesigner } from "./layoutDesigner";
import { Toaster } from "../utils/toaster";
import {Link} from "../components/components.js";
import { GifKeyboardHandler } from "./gifKeyboardHandler";
import { NotificationQuickAccessHandler } from "./notifications/notificationQuickAccessHandler";
import { NotificationFeedHandler } from "./notifications/notificationFeedHandler.js";
import {
	ActivityPostHandler
} from "./activityPostHandler";
import {MarkdownHotkeys} from "./markdownHotkeys";
import {PasteHandler} from "./pasteHandler";
import {MiniProfileHandler} from "./miniProfileHandler";
import {VideoFixer} from "./videoFixer";
import {MessageFeedHandler} from "./messageFeed/messageFeedHandler";
import {QuickStartHandler} from "./quickStart/quickStartHandler";
import {QuoteHandler} from "./quoteHandler";
import {DomDataHandler} from "./domDataHandler";
import {MarkdownTaskbarHandler} from "./markdownTaskbarHandler";
import {SettingsUi} from "./settingsUi";
import {PollHandler} from "./pollHandler/pollHandler";
import {InProgressHandler} from "./inProgress/inProgressHandler";
import {MiniMediaHandler} from "./miniMediaHandler";
import {MediaListHandler} from "./mediaListHandler";
import {ProfileHandler} from "./profileHandler";
import {ToudaiHandler} from "./toudaiHandler";

export class IntervalScriptHandler {
	styleHandler;
	settings;
	quickAccess;
	notificationQuickAccessHandler;
	notificationFeedHandler;
	activityPostHandler;
	markdownHotkeys;
	pasteHandler;
	constructor(settings) {
		this.settings = settings;

		this.styleHandler = new StyleHandler(settings);

		this.quickAccess = new QuickAccess(settings);
		this.notificationQuickAccessHandler =
			new NotificationQuickAccessHandler(settings);
		this.notificationFeedHandler = new NotificationFeedHandler(settings);
		this.activityPostHandler = new ActivityPostHandler(settings);
		this.markdownHotkeys = new MarkdownHotkeys(settings);
		this.pasteHandler = new PasteHandler(settings);
	}

	currentPath = "";
	evaluationIntervalInSeconds = 1;

	hasPathChanged(path: string) {
		if (path === this.currentPath) {
			return false;
		}
		this.currentPath = path;
		return true;
	}

	handleIntervalScripts(intervalScriptHandler: IntervalScriptHandler) {
		const path = window.location.pathname;

		DomDataHandler.addActivityIdsToDom();
		DomDataHandler.addReplyIdsToDom();

		QuickStartHandler.addNavigationButtons();
		ActivityHandler.moveAndDisplaySubscribeButton();
		ActivityHandler.addSelfMessageButton();
		ActivityHandler.removeBlankFromAnilistLinks();
		ActivityHandler.addCollapseReplyButtons();
		GifKeyboardHandler.handleGifKeyboard();
		LayoutDesigner.renderLayoutPreview();
		intervalScriptHandler.notificationFeedHandler.renderNotificationsFeed();
		intervalScriptHandler.markdownHotkeys.renderSettings();
		intervalScriptHandler.pasteHandler.registerDragAndDropInputs();
		ActivityHandler.handleImageLinkPreview();
		MiniProfileHandler.addUserHoverListeners();
		MiniMediaHandler.addMediaHoverListeners();
		ActivityHandler.addTooltipsToTimestamps();
		VideoFixer.replaceVideosWithLinks();
		QuoteHandler.addQuoteClickHandlers();
		DomDataHandler.scrollToReply();
		QuoteHandler.addDirectLinksToReplies();
		MarkdownTaskbarHandler.addTaskbars();
		PollHandler.addPollForms();
		PollHandler.replacePollImages();
		MediaListHandler.handleSocialTab();
		ToudaiHandler.replaceLinksWithLighthouseCard();
		ToudaiHandler.addLighthouseTab();
		ActivityHandler.addTailButtons();

		if (path === "/home") {
			intervalScriptHandler.styleHandler.refreshHomePage();
			intervalScriptHandler.quickAccess.renderQuickAccess();
			intervalScriptHandler.notificationQuickAccessHandler.renderNotifications();
			intervalScriptHandler.activityPostHandler.render();
			MessageFeedHandler.addFeedFilter();
			InProgressHandler.replaceInProgressSection();

		} else {
			intervalScriptHandler.notificationQuickAccessHandler.resetShouldRender();
		}

		if (!path.startsWith("/settings/developer")) {
			SettingsUi.removeSettings();
		}

		if (!intervalScriptHandler.hasPathChanged(path)) {
			return;
		}

		if (path.startsWith("/user/")) {
			intervalScriptHandler.quickAccess.clearBadge();
			intervalScriptHandler.styleHandler.verifyProfile();
			ProfileHandler.addVerifyButtonToProfile();
		} else {
			intervalScriptHandler.styleHandler.clearStyles("profile");
		}

		GlobalCSS.createCss();

		if (path.startsWith("/settings/developer")) {
			SettingsUi.render();
		}
	}

	enableScriptIntervalHandling() {
		const interval = setInterval(() => {
			try {
				this.handleIntervalScripts(this);
			} catch (error) {
				console.error(error);
				Toaster.critical([
					"A critical error has occured running interval script loop. VoidVerified is not working correctly. Please check developer console and contact ",
					Link(
						"voidnyan",
						"/user/voidnyan/",
						"_blank",
					),
					".",
				]);
				clearInterval(interval);
			}
		}, this.evaluationIntervalInSeconds * 1000);
	}

}
