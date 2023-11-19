import { Settings } from "./settings";
import { StyleHandler } from "./styleHandler";
import { IntervalScriptHandler } from "./intervalScriptHandler";
import { AnilistAPI } from "./anilistAPI";

const settings = new Settings();
const styleHandler = new StyleHandler(settings);
const intervalScriptHandler = new IntervalScriptHandler(settings);

styleHandler.refreshStyles();
intervalScriptHandler.enableScriptIntervalHandling();

const anilistAPI = new AnilistAPI(settings);

anilistAPI.queryUserData();

console.log(`VoidVerified ${settings.version} loaded.`);
