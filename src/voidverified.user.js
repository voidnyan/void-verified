import { Settings } from "./settings";
import { SettingsUserInterface } from "./settingsUserInterface";
import { StyleHandler } from "./styleHandler";
import { IntervalScriptHandler } from "./intervalScriptHandler";
import { ActivityHandler } from "./activityHandler";

const settings = new Settings();
const styleHandler = new StyleHandler(settings);
const settingsUi = new SettingsUserInterface(settings, styleHandler);
const activityHandler = new ActivityHandler(settings);
const intervalScriptHandler = new IntervalScriptHandler(
	styleHandler,
	settingsUi,
	activityHandler
);

styleHandler.refreshStyles();

intervalScriptHandler.enableScriptIntervalHandling();

console.log(`VoidVerified ${settings.Version} loaded.`);
