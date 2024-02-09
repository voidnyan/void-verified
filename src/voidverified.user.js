import { Settings } from "./settings";
import { StyleHandler } from "./styleHandler";
import { IntervalScriptHandler } from "./intervalScriptHandler";
import { AnilistAPI } from "./api/anilistAPI";
import { PasteHandler } from "./pasteHandler";
import { styles } from "./styles";
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
