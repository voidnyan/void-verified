import styles from "./styles.css";
import markdownDialog from "./markdownDialog.css";
import keyInput from "./keyInput.css";
import {StyleHandler} from "../../handlers/styleHandler";
import {Settings} from "../../utils/settings";

export class StyleRegister {
	static registerStyles() {
		const styleHandler = new StyleHandler(new Settings());
		const css = [styles, markdownDialog, keyInput];
		styleHandler.createStyleLink(css.join("\n"), "script");
		// styleHandler.createStyleLink(markdownDialog, "markdown-dialog");
		// styleHandler.createStyleLink(keyInput, "key-input");
	}
}
