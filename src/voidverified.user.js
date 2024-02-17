import { Settings } from "./utils/settings";
import { StyleHandler } from "./handlers/styleHandler";
import { IntervalScriptHandler } from "./handlers/intervalScriptHandler";
import { PasteHandler } from "./handlers/pasteHandler";
import { styles } from "./assets/styles";
import { ImgurAPI } from "./api/imgurAPI";
import { ImageHostService, imageHosts } from "./api/imageHostConfiguration";
import { Toaster } from "./utils/toaster";
import { ChangeLog } from "./utils/changeLog";

const settings = new Settings();
Toaster.initializeToaster(settings);
const styleHandler = new StyleHandler(settings);
styleHandler.refreshStyles();

try {
	const intervalScriptHandler = new IntervalScriptHandler(settings);
	intervalScriptHandler.enableScriptIntervalHandling();
} catch (error) {
	Toaster.critical(
		"A critical error has occured setting up intervalScriptHandler. Please check developer console and contact voidnyan."
	);
	console.error(error);
}

try {
	const pasteHandler = new PasteHandler(settings);
	pasteHandler.setup();
} catch (error) {
	Toaster.critical(
		"A critical error has occured setting up pasteHandler. Please check developer console and contact voidnyan."
	);
}

new ChangeLog(settings).renderChangeLog();

styleHandler.createStyleLink(styles, "script");

new ImgurAPI(
	new ImageHostService().getImageHostConfiguration(imageHosts.imgur)
).refreshAuthToken();

console.log(`VoidVerified ${settings.version} loaded.`);
