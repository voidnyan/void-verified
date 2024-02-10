import { Settings } from "./utils/settings";
import { StyleHandler } from "./handlers/styleHandler";
import { IntervalScriptHandler } from "./handlers/intervalScriptHandler";
import { PasteHandler } from "./handlers/pasteHandler";
import { styles } from "./assets/styles";
import { ImgurAPI } from "./api/imgurAPI";
import { ImageHostService, imageHosts } from "./api/imageHostConfiguration";
import { Toaster } from "./utils/toaster";

const settings = new Settings();
Toaster.initializeToaster(settings);
const styleHandler = new StyleHandler(settings);
const intervalScriptHandler = new IntervalScriptHandler(settings);
const pasteHandler = new PasteHandler(settings);

styleHandler.refreshStyles();
intervalScriptHandler.enableScriptIntervalHandling();

pasteHandler.setup();

new ImgurAPI(
	new ImageHostService().getImageHostConfiguration(imageHosts.imgur)
).refreshAuthToken();

styleHandler.createStyleLink(styles, "script");

console.log(`VoidVerified ${settings.version} loaded.`);
