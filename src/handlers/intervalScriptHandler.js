import { GlobalCSS } from "./globalCSS.js";
import { ActivityHandler } from "./activityHandler.js";
import { SettingsUserInterface } from "./settingsUserInterface.js";
import { StyleHandler } from "./styleHandler.js";
import { QuickAccess } from "./quickAccessHandler.js";
import { UserCSS } from "./userCSS.js";
import { LayoutDesigner } from "./layoutDesigner.js";
import { Toaster } from "../utils/toaster.js";
import { Link } from "../components/components.js";

export class IntervalScriptHandler {
	styleHandler;
	settingsUi;
	activityHandler;
	settings;
	globalCSS;
	quickAccess;
	userCSS;
	layoutDesigner;
	constructor(settings) {
		this.settings = settings;

		this.styleHandler = new StyleHandler(settings);
		this.globalCSS = new GlobalCSS(settings);
		this.userCSS = new UserCSS(settings);
		this.layoutDesigner = new LayoutDesigner(settings);

		this.settingsUi = new SettingsUserInterface(
			settings,
			this.styleHandler,
			this.globalCSS,
			this.userCSS,
			this.layoutDesigner
		);
		this.activityHandler = new ActivityHandler(settings);
		this.quickAccess = new QuickAccess(settings);
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

	handleIntervalScripts(intervalScriptHandler) {
		const path = window.location.pathname;

		intervalScriptHandler.activityHandler.moveAndDisplaySubscribeButton();
		intervalScriptHandler.activityHandler.removeBlankFromAnilistLinks();
		intervalScriptHandler.globalCSS.clearCssForProfile();
		intervalScriptHandler.layoutDesigner.renderLayoutPreview();

		if (path === "/home") {
			intervalScriptHandler.styleHandler.refreshHomePage();
			intervalScriptHandler.quickAccess.renderQuickAccess();
		}

		if (!path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.removeSettingsUi();
		}

		if (!intervalScriptHandler.hasPathChanged(path)) {
			return;
		}

		if (path.startsWith("/user/")) {
			intervalScriptHandler.userCSS.checkUserCss();
			intervalScriptHandler.quickAccess.clearBadge();
			intervalScriptHandler.styleHandler.verifyProfile();
		} else {
			intervalScriptHandler.styleHandler.clearStyles("profile");
		}

		if (path.startsWith("/activity/")) {
			intervalScriptHandler.userCSS.checkActivityCss();
		}

		if (!path.startsWith("/activity/") && !path.startsWith("/user/")) {
			intervalScriptHandler.userCSS.resetCurrentActivity();
			intervalScriptHandler.userCSS.resetCurrentUser();
			intervalScriptHandler.styleHandler.clearStyles("user-css");
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
						"_blank"
					),
					".",
				]);
				clearInterval(interval);
				console.error(error);
			}
		}, this.evaluationIntervalInSeconds * 1000);
	}
}
