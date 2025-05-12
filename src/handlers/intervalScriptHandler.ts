import { GlobalCSS } from "./globalCSS";
import { ActivityHandler } from "./activityHandler.js";
import { StyleHandler } from "./styleHandler.js";
import { QuickAccess } from "./quickAccessHandler.js";
import { LayoutDesigner } from "./layoutDesigner";
import { Toaster } from "../utils/toaster";
import {Link} from "../components/components.js";
import { GifKeyboardHandler } from "./gifKeyboardHandler.js";
import { AnilistFeedFixHandler } from "./anilistFeedFixHandler.js";
import { NotificationQuickAccessHandler } from "./notifications/notificationQuickAccessHandler";
import { NotificationFeedHandler } from "./notifications/notificationFeedHandler.js";
import {
	ActivityPostHandler
} from "./activityPostHandler";
import {MarkdownHotkeys} from "./markdownHotkeys";
import {PasteHandler} from "./pasteHandler";
import {GoalsHandler} from "./goalsHandler";
import {MiniProfileHandler} from "./miniProfileHandler";
import {VideoFixer} from "./videoFixer";
import {MessageFeedHandler} from "./messageFeed/messageFeedHandler";
import {QuickStartHandler} from "./quickStart/quickStartHandler";
import {QuoteHandler} from "./quoteHandler";
import {DomDataHandler} from "./domDataHandler";
import {MarkdownTaskbarHandler} from "./markdownTaskbarHandler";
import {SettingsUi} from "./settingsUi";
import {PollHandler} from "./pollHandler/pollHandler";

export class IntervalScriptHandler {
	styleHandler;
	activityHandler;
	settings;
	quickAccess;
	gifKeyboard;
	anilistFeedFixHandler;
	notificationQuickAccessHandler;
	notificationFeedHandler;
	activityPostHandler;
	markdownHotkeys;
	pasteHandler;
	constructor(settings) {
		this.settings = settings;

		this.styleHandler = new StyleHandler(settings);
		this.gifKeyboard = new GifKeyboardHandler(settings);

		this.activityHandler = new ActivityHandler(settings);
		this.quickAccess = new QuickAccess(settings);
		this.anilistFeedFixHandler = new AnilistFeedFixHandler(settings);
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
		intervalScriptHandler.activityHandler.moveAndDisplaySubscribeButton();
		intervalScriptHandler.activityHandler.addSelfMessageButton();
		intervalScriptHandler.activityHandler.removeBlankFromAnilistLinks();
		intervalScriptHandler.activityHandler.addCollapseReplyButtons();
		intervalScriptHandler.gifKeyboard.handleGifKeyboard();
		LayoutDesigner.renderLayoutPreview();
		intervalScriptHandler.anilistFeedFixHandler.handleFix();
		intervalScriptHandler.notificationFeedHandler.renderNotificationsFeed();
		intervalScriptHandler.markdownHotkeys.renderSettings();
		intervalScriptHandler.pasteHandler.registerDragAndDropInputs();
		intervalScriptHandler.activityHandler.handleImageLinkPreview();
		MiniProfileHandler.addUserHoverListeners();
		intervalScriptHandler.activityHandler.addTooltipsToTimestamps();
		VideoFixer.replaceVideosWithLinks();
		QuoteHandler.addQuoteClickHandlers();
		DomDataHandler.scrollToReply();
		QuoteHandler.addDirectLinksToReplies();
		MarkdownTaskbarHandler.addTaskbars();
		PollHandler.addPollForms();
		PollHandler.replacePollImages();

		if (path === "/home") {
			intervalScriptHandler.styleHandler.refreshHomePage();
			intervalScriptHandler.quickAccess.renderQuickAccess();
			intervalScriptHandler.notificationQuickAccessHandler.renderNotifications();
			intervalScriptHandler.activityPostHandler.render();
			MessageFeedHandler.addFeedFilter();

		} else {
			intervalScriptHandler.notificationQuickAccessHandler.resetShouldRender();
		}

		if (!path.startsWith("/settings/developer")) {
			SettingsUi.removeSettings();
		}

		if (!intervalScriptHandler.hasPathChanged(path)) {
			return;
		}

		GoalsHandler.removeGoalsContainer();

		if (path.startsWith("/user/")) {
			intervalScriptHandler.quickAccess.clearBadge();
			intervalScriptHandler.styleHandler.verifyProfile();
			intervalScriptHandler.anilistFeedFixHandler.handleFilters();
			GoalsHandler.renderGoals();
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
