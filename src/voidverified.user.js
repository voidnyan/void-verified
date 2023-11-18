import { Settings } from "./settings";
import { StyleHandler } from "./styleHandler";
import { IntervalScriptHandler } from "./intervalScriptHandler";

const settings = new Settings();
const styleHandler = new StyleHandler(settings);
const intervalScriptHandler = new IntervalScriptHandler(settings);

styleHandler.refreshStyles();
intervalScriptHandler.enableScriptIntervalHandling();

console.log(`VoidVerified ${settings.version} loaded.`);
