import { Settings } from "./settings";
import { StyleHandler } from "./styleHandler";
import { IntervalScriptHandler } from "./intervalScriptHandler";
import { AnilistAPI } from "./api/anilistAPI";
import { PasteHandler } from "./pasteHandler";
import { styles } from "./styles";

const settings = new Settings();
const styleHandler = new StyleHandler(settings);
const intervalScriptHandler = new IntervalScriptHandler(settings);
const anilistAPI = new AnilistAPI(settings);
const pasteHandler = new PasteHandler(settings);

styleHandler.refreshStyles();
intervalScriptHandler.enableScriptIntervalHandling();

anilistAPI.queryUserData();
pasteHandler.setup();

styleHandler.createStyleLink(styles, "script");

console.log(`VoidVerified ${settings.version} loaded.`);
