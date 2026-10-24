import {StaticSettings} from "../../utils/staticSettings";
import {GifKeyboardElement} from "./gifKeyboardElement";
import {IconButton} from "../components";
import {FaceSmileIcon, GifIcon} from "../../assets/icons";
import {DOM} from "../../utils/DOM";
import {EmojiKeyboard} from "./emojiKeyboard";

export class NativeMarkdownEditor {
	markdownEditor: HTMLDivElement;
	panel = DOM.createDiv("markdown-editor-panel hidden");
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
		this.addEmojiKeyboard();
	}

	private togglePanelVisibility(element: HTMLDivElement) {
		if (this.panel.children[0] === element)
			this.panel.classList.toggle("void-hidden");
		else {
			this.panel.classList.remove("void-hidden");
		}
		this.panel.replaceChildren(element);
	}

	private addEmojiKeyboard() {
		if (!StaticSettings.options.emojiKeyboardEnabled.getValue()) {
			return;
		}

		const emojiKeyboard = new EmojiKeyboard(this.markdownEditor);
		const iconButton = IconButton(FaceSmileIcon(), () => {
			emojiKeyboard.renderEmojiList();
			this.togglePanelVisibility(emojiKeyboard.element);
		}, "gif-button") as HTMLDivElement;
		iconButton.setAttribute("title", "Emoji Keyboard");
		this.controls.push(iconButton);
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
