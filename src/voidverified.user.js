import { StyleHandler } from "./handlers/styleHandler";
import { IntervalScriptHandler } from "./handlers/intervalScriptHandler";
import { PasteHandler } from "./handlers/pasteHandler";
import { ImgurAPI } from "./api/imgurAPI";
import { ImageHostService, imageHosts } from "./api/imageHostConfiguration";
import { Toaster } from "./utils/toaster";
import { ChangeLog } from "./utils/changeLog";
import {LibraryLoader} from "./handlers/libraryLoader";
import {MarkdownHotkeys} from "./handlers/markdownHotkeys";
import {StyleRegister} from "./assets/styles/styleRegister";
import {StaticSettings} from "./utils/staticSettings";
import {GoalsHandler} from "./handlers/goalsHandler";
import {QuickStartHandler} from "./handlers/quickStart/quickStartHandler";
import {Vue} from "./utils/vue";
import {StaticTooltip} from "./utils/staticTooltip";
import {CloseOverlaysHandler} from "./utils/closeOverlaysHandler";

StaticSettings.initialize();
LibraryLoader.loadLibraries();
Vue.ensureIsRegistered();
StaticTooltip.initialize();

GoalsHandler.initialize();
new MarkdownHotkeys(StaticSettings.settingsInstance).setupMarkdownHotkeys();
QuickStartHandler.initialize();
Toaster.initializeToaster(StaticSettings.settingsInstance);
const styleHandler = new StyleHandler(StaticSettings.settingsInstance);
styleHandler.refreshStyles();
StyleRegister.registerStyles();
CloseOverlaysHandler.initialize();

try {
	const intervalScriptHandler = new IntervalScriptHandler(StaticSettings.settingsInstance);
	intervalScriptHandler.enableScriptIntervalHandling();
} catch (error) {
	Toaster.critical(
		"A critical error has occured setting up intervalScriptHandler. Please check developer console and contact voidnyan.",
	);
	console.error(error);
}

try {
	const pasteHandler = new PasteHandler(StaticSettings.settingsInstance);
	pasteHandler.setup();
} catch (error) {
	Toaster.critical(
		"A critical error has occured setting up pasteHandler. Please check developer console and contact voidnyan.",
	);
}

new ChangeLog(StaticSettings.settingsInstance).renderChangeLog();

new ImgurAPI(
	new ImageHostService().getImageHostConfiguration(imageHosts.imgur),
).refreshAuthToken();

console.log(`VoidVerified ${StaticSettings.settingsInstance.version} loaded.`);
