import { GlobalCSS } from "./globalCSS";
import { ActivityHandler } from "./activityHandler.js";
import { SettingsUserInterface } from "./settingsUserInterface";
import { StyleHandler } from "./styleHandler";
import { QuickAccess } from "./quickAccessHandler";
import { UserCSS } from "./userCSS.js";

export class IntervalScriptHandler {
	styleHandler;
	settingsUi;
	activityHandler;
	settings;
	globalCSS;
	quickAccess;
	userCSS;
	constructor(settings) {
		this.settings = settings;

		this.styleHandler = new StyleHandler(settings);
		this.globalCSS = new GlobalCSS(settings);
		this.settingsUi = new SettingsUserInterface(
			settings,
			this.styleHandler,
			this.globalCSS
		);
		this.activityHandler = new ActivityHandler(settings);
		this.quickAccess = new QuickAccess(settings);
		this.userCSS = new UserCSS(settings);
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
		intervalScriptHandler.globalCSS.clearCssForProfile();

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

		intervalScriptHandler.globalCSS.createCss();

		if (path.startsWith("/user/")) {
			intervalScriptHandler.styleHandler.verifyProfile();
			intervalScriptHandler.quickAccess.clearBadge();
		} else {
			intervalScriptHandler.styleHandler.clearProfileVerify();
		}

		if (path.startsWith("/activity/")) {
			intervalScriptHandler.userCSS.checkActivityCss();
		} else {
			intervalScriptHandler.styleHandler.clearStyles("activity-css");
			intervalScriptHandler.userCSS.resetCurrentActivity();
		}

		if (path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.renderSettingsUi();
		}
	}

	enableScriptIntervalHandling() {
		setInterval(() => {
			this.handleIntervalScripts(this);
		}, this.evaluationIntervalInSeconds * 1000);
	}
}
