export class IntervalScriptHandler {
	styleHandler;
	settingsUi;
	activityHandler;
	constructor(stylehandler, settingsUi, activityHandler) {
		this.styleHandler = stylehandler;
		this.settingsUi = settingsUi;
		this.activityHandler = activityHandler;
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

		if (path === "/home") {
			intervalScriptHandler.styleHandler.refreshHomePage();
			return;
		}

		if (!path.startsWith("/settings/developer")) {
			intervalScriptHandler.settingsUi.removeSettingsUi();
		}

		if (!intervalScriptHandler.hasPathChanged(path)) {
			return;
		}

		intervalScriptHandler.styleHandler.clearProfileVerify();

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
