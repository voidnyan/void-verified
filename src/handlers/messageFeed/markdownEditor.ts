import {DOM} from "../../utils/DOM";
import {
	BoldIcon, CenterTextIcon, CodeIcon, HeaderIcon,
	ImageIcon,
	ItalicIcon,
	LinkIconMarkdown, OrderedListIcon, QuoteIcon,
	SpoilerIcon,
	StrikeThroughIcon, UnorderedListIcon, WebMIcon,
	YoutubeIcon
} from "../../assets/icons";
import {IUser} from "../../api/types/user";
import {Markdown} from "../../utils/markdown";
import {Debouncer} from "../../utils/debouncer";
import {MarkdownCommands, MarkdownFunctions} from "../../utils/markdownFunctions";
import {IActivityReply} from "../../api/queries/queryActivityReplies";
import {BaseActivityComponent} from "../../components/activity/baseActivityComponent";
import {ITextActivity} from "../../api/types/ITextActivity";
import {IMessageActivity} from "../../api/types/messageActivity";
import {AnilistAPI} from "../../api/anilistAPI";
import {StaticSettings} from "../../utils/staticSettings";
import {Toaster} from "../../utils/toaster";

export class MarkdownEditor {
	readonly element: HTMLDivElement;
	private readonly markdownEditor: HTMLDivElement;
	private readonly actions: HTMLDivElement;
	private readonly rulesNotice: HTMLDivElement;
	private readonly input: HTMLDivElement;
	textArea: HTMLTextAreaElement;
	private readonly previewHeader: HTMLHeadingElement;
	private readonly preview: HTMLDivElement;
	private readonly debouncer = new Debouncer();
	private readonly publishCallback: (reply: string) => void;
	private readonly cancelCallback: () => void;

	private isVisible = false;

	constructor(publishCallback: (reply: string) => void, cancelCallback?: () => void) {
		this.publishCallback = publishCallback;
		this.cancelCallback = cancelCallback;
		this.element = DOM.create("div", ".activity-edit activity-edit");
		this.markdownEditor = this.createMarkdownEditorBar();
		this.input = this.createTextArea();
		this.previewHeader = DOM.create("h2", ".section-header hidden", "Preview");
		this.preview = this.createPreview();
		this.actions = this.createActions();
		this.rulesNotice = this.createRulesNotice();
		this.element.append(
			this.markdownEditor,
			this.input,
			this.previewHeader,
			this.preview,
			this.rulesNotice,
			this.actions);
	}

	toggleVisibility(visible: boolean) {
		this.isVisible = visible;
		if (this.isVisible) {
			this.markdownEditor.classList.remove("void-hidden");
			this.rulesNotice.classList.remove("void-hidden");
			this.actions.classList.remove("void-hidden");
			this.handlePreviewVisibility();
		} else {
			this.markdownEditor.classList.add("void-hidden");
			this.rulesNotice.classList.add("void-hidden");
			this.actions.classList.add("void-hidden");
			this.handlePreviewVisibility();
			this.preview.querySelector(".markdown").innerHTML = "";
		}
	}

	setContent(value: string) {
		this.textArea.value = value;
	}

	handlePreviewVisibility() {
		const markdown = this.preview.querySelector(".markdown").innerHTML;
		if (!markdown || markdown.trim() === "" || markdown.trim() === "<p></p>" || !this.isVisible) {
			this.preview.classList.add("void-hidden");
			this.previewHeader.classList.add("void-hidden");
		}  else {
			this.preview.classList.remove("void-hidden");
			this.previewHeader.classList.remove("void-hidden");
		}
	}

	private resizeTextarea(){
		this.textArea.style.height = "auto";
		this.textArea.style.height = this.textArea.scrollHeight + "px";
	}

	private createMarkdownEditorBar(): HTMLDivElement {
		const markdownEditor = DOM.createDiv(".markdown-editor hidden");
		for (const item of this.markdownBarItems) {
			const action = DOM.create("div", null, item.icon);
			action.setAttribute("title", item.label);
			action.addEventListener("click", () => {
				const command = MarkdownCommands.find(x => x.description === item.label);
				MarkdownFunctions.handleCommand(command, this.textArea);
			})
			markdownEditor.append(action);
		}
		return markdownEditor;
	}

	private createTextArea(): HTMLDivElement {
		const textAreaContainer = DOM.createDiv(".input .el-textarea");
		this.textArea = DOM.create("textarea", ".el-textarea__inner");
		this.textArea .setAttribute("autocomplete", "off");
		this.textArea .setAttribute("placeholder", "Write a reply...");
		this.textArea .setAttribute("style", "min-height: 35px; height: 35px;");
		textAreaContainer.append(this.textArea );

		this.textArea.addEventListener("focus", () => {
			this.toggleVisibility(true);
		});

		this.textArea .addEventListener("input", (event: InputEvent) => {
			const target = event.target as HTMLTextAreaElement;
			this.debouncer.debounce(this.handleInput.bind(this), 50, target.value);
		})

		return textAreaContainer;
	}

	handleInput(value: string) {
		this.resizeTextarea();
		this.preview.querySelector(".markdown").innerHTML = Markdown.parse(value);
		Markdown.applyFunctions(this.preview.querySelector(".markdown"));
		this.handlePreviewVisibility();
	}

	private createPreview(): HTMLDivElement {
		const preview = DOM.createDiv(".reply .preview hidden");
		const header = DOM.create("div", ".header");
		const user: IUser = JSON.parse(localStorage.getItem("auth"));
		const {avatar, name} = BaseActivityComponent.createHeaderUser(user);
		header.append(avatar, name);

		const replyMarkdown = DOM.create("div", ".reply-markdown");
		const markdown = DOM.create("div", ".markdown");
		replyMarkdown.append(markdown);

		preview.append(header, replyMarkdown);
		return preview;
	}

	private createActions(): HTMLDivElement {
		const actions = DOM.createDiv(".actions hidden");
		const cancelButton = DOM.createDiv(".button .cancel", "Cancel");
		cancelButton.addEventListener("click", (event) => {
			event.stopPropagation()
			this.cancel();
		});
		const publishButton = DOM.create("div", ".button .save", "Publish");
		publishButton.addEventListener("click", () => {
			this.publish();
		})
		actions.append(cancelButton, publishButton);
		return actions;
	}

	private async publish() {
		const reply = this.textArea.value;
		this.publishCallback(reply);
		this.cancel();
	}

	private cancel() {
		this.toggleVisibility(false);
		this.textArea.value = "";
		if (this.cancelCallback) {
			this.cancelCallback();
		}
	}

	private createRulesNotice(): HTMLDivElement {
		const rulesNotice = DOM.createDiv(".rules-notice hidden");
		const rulesLink = DOM.create("a", null, "Please read the site guidelines before posting");
		rulesLink.setAttribute("href", "/forum/thread/14");
		rulesLink.setAttribute("target", "_blank");
		rulesNotice.append(rulesLink);
		return rulesNotice;
	}

	private readonly markdownBarItems = [
		{
			icon: BoldIcon(),
			label: "Bold"
		},
		{
			icon: ItalicIcon(),
			label: "Italic"
		},
		{
			icon: StrikeThroughIcon(),
			label: "Strikethrough"
		},
		{
			icon: SpoilerIcon(),
			label: "Spoiler!"
		},
		{
			icon: LinkIconMarkdown(),
			label: "Link"
		},
		{
			icon: ImageIcon(),
			label: "Image"
		},
		{
			icon: YoutubeIcon(),
			label: "Youtube Video"
		},
		{
			icon: WebMIcon(),
			label: "WebM Video"
		},
		{
			icon: OrderedListIcon(),
			label: "Ordered List"
		},
		{
			icon: UnorderedListIcon(),
			label: "Unordered List"
		},
		{
			icon: HeaderIcon(),
			label: "Header"
		},
		{
			icon: CenterTextIcon(),
			label: "Center"
		},
		{
			icon: QuoteIcon(),
			label: "Quote"
		},
		{
			icon: CodeIcon(),
			label: "Code"
		}
	]
}
