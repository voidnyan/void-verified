import styles from "./styles.css";
import markdownDialog from "./markdownDialog.css";
import keyInput from "./keyInput.css";
import goals from "./goals.css";
import miniProfile from "./miniProfile.css";
import quickStart from "./quickStart.css";
import activity from "./activity.css";
import markdownEditor from "./markdownEditor.css";
import collapsibleContainer from "./collapsibleContainer.css";
import dialog from "./dialog.css";
import dropdownMenu from "./dropdownMenu.css";
import markdownTaskbar from "./markdownTaskbar.css";
import fileInput from "./fileInput.css";
import markdownDraftManager from "./markdownDraftManager.css";

import {StyleHandler} from "../../handlers/styleHandler";
import {Settings} from "../../utils/settings";

export class StyleRegister {
	static registerStyles() {
		const styleHandler = new StyleHandler(new Settings());
		const css = [
			styles,
			markdownDialog,
			keyInput,
			goals,
			miniProfile,
			quickStart,
			activity,
			markdownEditor,
			collapsibleContainer,
			dialog,
			dropdownMenu,
			markdownTaskbar,
			fileInput,
			markdownDraftManager
		];
		styleHandler.createStyleLink(css.join("\n"), "script");
	}
}
