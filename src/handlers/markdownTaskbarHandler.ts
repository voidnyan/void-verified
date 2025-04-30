import {StaticSettings} from "../utils/staticSettings";
import {MarkdownTaskbar} from "../components/markdownTaskbar";

export class MarkdownTaskbarHandler {
	static addTaskbars() {
		if (!StaticSettings.options.markdownTaskbarEnabled.getValue()) {
			return;
		}

		const textareas = document.querySelectorAll<HTMLDivElement>(".activity-edit .input.el-textarea:not(:has(.void-markdown-taskbar))");

		for (const textarea of textareas) {
			this.addTaskbar(textarea);
		}
	}

	private static addTaskbar(textareaContainer: HTMLDivElement) {
		const markdownTaskbar = new MarkdownTaskbar(textareaContainer.querySelector("textarea"));
		textareaContainer.append(markdownTaskbar.element);
	}
}
