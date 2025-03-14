import hotkeys from "../libraries/hotkeys";
import {QuickStartHandler} from "../handlers/quickStart/quickStartHandler";
import {Dialog} from "./dialog";

export class CloseOverlaysHandler {
	static initialize() {
		hotkeys("esc", "all", () => {
			if (Dialog.isOpen()) {
				Dialog.close();
			} else if (QuickStartHandler.isOpen()) {
				QuickStartHandler.closeQuickStart();
			}
		})
	}
}
