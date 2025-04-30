import {DOM} from "../utils/DOM";
import {StaticSettings} from "../utils/staticSettings";
import {FileInputIconComponent} from "./fileInputIconComponent";
import {ImageApiFactory} from "../api/imageApiFactory";
import {PasteHandler} from "../handlers/pasteHandler";
import {ImageHostService} from "../api/imageHostConfiguration";
import {DropdownMenuComponent} from "./dropdownComponent";
import {StaticTooltip} from "../utils/staticTooltip";
import {ChevronUpDownIcon, DocumentTextIcon, ImageIcon, LinkIcon} from "../assets/icons";
import {RangeField} from "./components";
import {DropdownDirection, PopOverComponent} from "./popOverComponent";
import {MarkdownDraftManager} from "./markdownDraftManager";

export class MarkdownTaskbar {
	element: HTMLDivElement;
	textarea: HTMLTextAreaElement;
	private readonly characterCounter: HTMLDivElement;
	private readonly endContainer: HTMLDivElement;

	constructor(textarea: HTMLTextAreaElement) {
		this.textarea = textarea;
		this.endContainer = DOM.createDiv("align-right");
		this.characterCounter = DOM.createDiv();
		this.endContainer.append(this.characterCounter);
		this.element = DOM.create("div", "markdown-taskbar has-icon", this.createItems());
		setTimeout(() => {
			textarea
				.closest(".activity-edit")
				?.querySelector('.void-icon-button[title="Reply to Activity"]')
				?.addEventListener("click", () => {
					this.updateCharacterCounter();
				})
		}, 100);
	}

	private createItems() {
		const items: HTMLElement[] = [];

		if (StaticSettings.options.pasteImagesToHostService.getValue()) {
			items.push(...this.createImageHostItems());
		}

		items.push(this.createDraftManager());

		this.updateCharacterCounter();
		const characterCountPopout = DOM.create("div", null, MarkdownDraftManager.createCharacterCounts(this.textarea.value));
		StaticTooltip.register(this.characterCounter, characterCountPopout);
		this.textarea.addEventListener("input", (event) => {
			const target = event.target as HTMLTextAreaElement;
			this.updateCharacterCounter();
			characterCountPopout.replaceChildren(MarkdownDraftManager.createCharacterCounts(target.value));
		});

		items.push(this.endContainer);

		return items;
	}

	private createImageHostItems() {
		const uploadButton = new FileInputIconComponent(async (event: Event) => {
			const target = event.target as HTMLInputElement;
			const images = [...target.files];
			const imageApi = ImageApiFactory.getImageHostInstance();

			const results = await Promise.all(images.map(image => imageApi.uploadImage(image)));
			const imageRows = results.filter(url => url !== null).map(url => PasteHandler.handleImg(url)).join("\n\n");
			const selectionStart = this.textarea.selectionStart;
			const selectionEnd = this.textarea.selectionEnd;
			const beforeSelection = this.textarea.value.substring(0, selectionStart);
			const afterSelection = this.textarea.value.substring(selectionEnd);

			this.textarea.value = beforeSelection + imageRows + afterSelection;
			this.textarea.selectionStart = selectionStart;
			this.textarea.selectionEnd = selectionStart + imageRows.length;
			this.textarea.dispatchEvent(new Event("input", {bubbles: true}));
		});

		const initialHost = ImageHostService.getSelectedHost();
		const hostDropdown = new DropdownMenuComponent(
			["imgur", "catbox", "imgbb"],
			DOM.create("div", "markdown-taskbar-image-host", initialHost),
			(value: string) => {
				ImageHostService.setSelectedHost(value);
				hostDropdown.trigger.replaceChildren(value);
			},
			initialHost);

		const wrapWithLink = DOM.createDiv(null, LinkIcon());
		if (StaticSettings.options.pasteWrapImagesWithLink.getValue()) {
			wrapWithLink.classList.add("void-color-blue");
		}
		wrapWithLink.addEventListener("click", () => {
			const value = StaticSettings.options.pasteWrapImagesWithLink.getValue();
			StaticSettings.options.pasteWrapImagesWithLink.setValue(!value);
			if (value) {
				wrapWithLink.classList.remove("void-color-blue");
			} else {
				wrapWithLink.classList.add("void-color-blue");
			}
		});

		StaticTooltip.register(wrapWithLink, "Wrap images with a link");

		const wrapWithImage = DOM.createDiv(null, ImageIcon());
		if (StaticSettings.options.pasteEnabled.getValue()) {
			wrapWithImage.classList.add("void-color-blue");
		}
		wrapWithImage.addEventListener("click", () => {
			const value = StaticSettings.options.pasteEnabled.getValue();
			StaticSettings.options.pasteEnabled.setValue(!value);
			if (value) {
				wrapWithImage.classList.remove("void-color-blue");
			} else {
				wrapWithImage.classList.add("void-color-blue");
			}
		});

		const imageWidth = DOM.createDiv("icon-rotate-90", ChevronUpDownIcon());

		const widthRange = RangeField(StaticSettings.options.pasteImageWidthValue.getValue(), (event) => {
			StaticSettings.options.pasteImageWidthValue.setValue(event.target.value);
		}, 1000, 5, 10);

		const widthPercentage = DOM.createDiv(null, StaticSettings.options.pasteImageUnitIsPercentage.getValue() ? "%" : "PX");
		widthPercentage.addEventListener("click", () => {
			const value = StaticSettings.options.pasteImageUnitIsPercentage.getValue();
			StaticSettings.options.pasteImageUnitIsPercentage.setValue(!value);
			const range = widthRange.querySelector("input");
			const display = widthRange.querySelector(".void-range-display");
			if (!value) {
				const width = Math.min(StaticSettings.options.pasteImageWidthValue.getValue() as number, 100);
				StaticSettings.options.pasteImageWidthValue.setValue(width);
				range.value = width.toString();
				display.replaceChildren(width.toString());
				range.setAttribute("max", "100");
				widthPercentage.replaceChildren("%");
			} else {
				range.setAttribute("max", "1000");
				widthPercentage.replaceChildren("PX");
			}
		})

		StaticTooltip.register(imageWidth, DOM.createDiv("flex", [widthRange, widthPercentage]), true);

		StaticTooltip.register(wrapWithImage, "Wrap images with image tag");

		return [uploadButton.element, hostDropdown.trigger, wrapWithLink, wrapWithImage, imageWidth];
	}

	private createDraftManager() {
		const draftManager = new MarkdownDraftManager(this.textarea);
		const draftPopOver = new PopOverComponent(
			DOM.createDiv(null, DocumentTextIcon()),
			draftManager.element, {
				direction: DropdownDirection.top
			});


		return draftPopOver.trigger;
	}

	private updateCharacterCounter() {
		this.characterCounter.replaceChildren(this.textarea.value.length + ` / ${this.isReply() ? "8000" : "10000"}`);
	}

	private isReply() {
		return !!this.textarea.closest(".reply-wrap") ||
			!!this.textarea.closest(".activity-edit").querySelector(".void-activity-reply-controls-container[closed='false']");
	}
}
