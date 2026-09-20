import {StaticSettings} from "../../utils/staticSettings";
import {GifKeyboardElement} from "./gifKeyboardElement";
import {IconButton} from "../components";
import {GifIcon} from "../../assets/icons";
import {DOM} from "../../utils/DOM";

export class NativeMarkdownEditor {
	markdownEditor: HTMLDivElement;
	panel = DOM.createDiv("hidden");
	private controls: HTMLDivElement[] = [];
	constructor(markdownEditor: HTMLDivElement) {
		this.markdownEditor = markdownEditor;
		this.addFunctions();
		this.markdownEditor.parentElement.insertBefore(this.panel, this.markdownEditor.nextSibling);
	}

	injectToDom() {
		this.markdownEditor.parentNode.insertBefore(
			this.panel,
			this.markdownEditor.nextSibling,
		);

		this.markdownEditor.append(...this.controls);
	}

	private addFunctions(){
		this.addGifKeyboard();
	}

	private togglePanelVisibility(element: HTMLDivElement) {
		this.panel.replaceChildren(element);
		this.panel.classList.toggle("void-hidden");
	}

	private addGifKeyboard(){
		if (!StaticSettings.options.gifKeyboardEnabled.getValue()) {
			return;
		}

		const gifKeyboard = new GifKeyboardElement(this.markdownEditor);
		const iconButton = IconButton(
			GifIcon(),
			() => {
				this.togglePanelVisibility(
					gifKeyboard.element
				);
			},
			"gif-button",
		) as HTMLDivElement;
		iconButton.setAttribute("title", "GIF Keyboard");
		this.controls.push(iconButton);
	}
}
