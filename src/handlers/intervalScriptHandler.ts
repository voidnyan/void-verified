import { GlobalCSS } from "./globalCSS.js";
import { ActivityHandler } from "./activityHandler.js";
import { SettingsUserInterface } from "./settingsUserInterface.js";
import { StyleHandler } from "./styleHandler.js";
import { QuickAccess } from "./quickAccessHandler.js";
import { LayoutDesigner } from "./layoutDesigner.js";
import { Toaster } from "../utils/toaster.js";
import { Link } from "../components/components.js";
import { GifKeyboardHandler } from "./gifKeyboardHandler.js";
import { AnilistFeedFixHandler } from "./anilistFeedFixHandler.js";
import { NotificationQuickAccessHandler } from "./notifications/notificationQuickAccessHandler.js";
import { NotificationFeedHandler } from "./notifications/notificationFeedHandler.js";
import {
	ActivityPostHandler,
	IActivityPostHandler,
} from "./activityPostHandler";
import {IMarkdownHotkeys, MarkdownHotkeys} from "./markdownHotkeys";
import {PasteHandler} from "./pasteHandler";
import {GoalsHandler} from "./goalsHandler";
import {MiniProfileHandler} from "./miniProfileHandler";

interface IIntervalScriptsHandler {
	styleHandler: any;
	settingsUi: any;
	activityHandler: any;
	settings: any;
	globalCSS: any;
	quickAccess: any;
	layoutDesigner: any;
	gifKeyboard: any;
	anilistFeedFixHandler: any;
	notificationQuickAccessHandler: any;
	notificationFeedHandler: any;
	activityPostHandler: IActivityPostHandler;
	markdownHotkeys: IMarkdownHotkeys;
	pasteHandler: any;
	miniProfileHandler: MiniProfileHandler;
	hasPathChanged(path: string): boolean;
}

export class IntervalScriptHandler implements IIntervalScriptsHandler {
	styleHandler;
	settingsUi;
	activityHandler;
	settings;
	globalCSS;
	quickAccess;
	layoutDesigner;
	gifKeyboard;
	anilistFeedFixHandler;
	notificationQuickAccessHandler;
	notificationFeedHandler;
	activityPostHandler;
	markdownHotkeys;
	pasteHandler;
	miniProfileHandler: MiniProfileHandler;
	constructor(settings) {
		this.settings = settings;

		this.styleHandler = new StyleHandler(settings);
		this.globalCSS = new GlobalCSS(settings);
		this.layoutDesigner = new LayoutDesigner(settings);
		this.gifKeyboard = new GifKeyboardHandler(settings);

		this.miniProfileHandler = new MiniProfileHandler();
		this.settingsUi = new SettingsUserInterface(
			settings,
			this.styleHandler,
			this.globalCSS,
			this.layoutDesigner,
			this.miniProfileHandler
		);
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

	hasPathChanged(path) {
		if (path === this.currentPath) {
			return false;
		}
		this.currentPath = path;
		return true;
	}

	handleIntervalScripts(intervalScriptHandler: IIntervalScriptsHandler) {
		const path = window.location.pathname;

		intervalScriptHandler.activityHandler.moveAndDisplaySubscribeButton();
		intervalScriptHandler.activityHandler.addSelfMessageButton();
		intervalScriptHandler.activityHandler.removeBlankFromAnilistLinks();
		intervalScriptHandler.activityHandler.addCollapseReplyButtons();
		intervalScriptHandler.gifKeyboard.handleGifKeyboard();
		intervalScriptHandler.layoutDesigner.renderLayoutPreview();
		intervalScriptHandler.anilistFeedFixHandler.handleFix();
		intervalScriptHandler.notificationFeedHandler.renderNotificationsFeed();
		intervalScriptHandler.markdownHotkeys.renderSettings();
		intervalScriptHandler.pasteHandler.registerDragAndDropInputs();
		intervalScriptHandler.activityHandler.handleImageLinkPreview();
		intervalScriptHandler.miniProfileHandler.addUserHoverListeners();

		if (path === "/home") {
			intervalScriptHandler.styleHandler.refreshHomePage();
			intervalScriptHandler.quickAccess.renderQuickAccess();
			intervalScriptHandler.notificationQuickAccessHandler.renderNotifications();
			intervalScriptHandler.activityPostHandler.render();
		} else {
			intervalScriptHandler.notificationQuickAccessHandler.resetShouldRender();
		}

		if (!path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.removeSettingsUi();
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

		intervalScriptHandler.globalCSS.createCss();

		if (path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.renderSettingsUi();
		}
	}

	enableScriptIntervalHandling() {
		const interval = setInterval(() => {
			try {
				this.handleIntervalScripts(this);
			} catch (error) {
				Toaster.critical([
					"A critical error has occured running interval script loop. VoidVerified is not working correctly. Please check developer console and contact ",
					Link(
						"voidnyan",
						"https://anilist.co/user/voidnyan/",
						"_blank",
					),
					".",
				]);
				clearInterval(interval);
				console.error(error);
			}
		}, this.evaluationIntervalInSeconds * 1000);
	}
}
