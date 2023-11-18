import { GlobalCSS } from "./globalCSS";
import { ActivityHandler } from "./activityHandler.js";
import { SettingsUserInterface } from "./settingsUserInterface";
import { StyleHandler } from "./styleHandler";

export class IntervalScriptHandler {
	styleHandler;
	settingsUi;
	activityHandler;
	settings;
	globalCSS;
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
		}

		if (!path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.removeSettingsUi();
		}

		if (!intervalScriptHandler.hasPathChanged(path)) {
			return;
		}

		intervalScriptHandler.styleHandler.clearProfileVerify();
		intervalScriptHandler.globalCSS.createCss();

		if (path.startsWith("/user/")) {
			intervalScriptHandler.styleHandler.verifyProfile();
			intervalScriptHandler.styleHandler.copyUserColor();
			return;
		}

		if (path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.renderSettingsUi();
			return;
		}
	}

	enableScriptIntervalHandling() {
		setInterval(() => {
			this.handleIntervalScripts(this);
		}, this.evaluationIntervalInSeconds * 1000);
	}
}
