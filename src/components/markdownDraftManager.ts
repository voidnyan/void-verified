import {DOM} from "../utils/DOM";
import {Dialog} from "../utils/dialog";
import {DocumentArrowDownIcon, DocumentArrowUpIcon, RefreshIcon, XMarkIcon} from "../assets/icons";
import {Button} from "./components";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {Toaster} from "../utils/toaster";
import {StaticTooltip} from "../utils/staticTooltip";
import {Time} from "../utils/time";

interface IDraft {
	name: string,
	content: string,
	timestamp: Date | string
}

export class MarkdownDraftManager {
	element: HTMLDivElement;
	list: HTMLDivElement;

	textarea: HTMLTextAreaElement;

	constructor(textarea: HTMLTextAreaElement) {
		this.textarea = textarea;
		this.element = DOM.createDiv("markdown-draft-manager");
		this.element.append(DOM.createDiv("markdown-draft-header flex justify-center", "Drafts"));
		this.list = DOM.createDiv("markdown-draft-list has-icon icon-pointer");
		this.element.append(this.list);

		const saveButton = Button("Save New Draft", () => {
			if (this.textarea.value.length === 0) {
				Toaster.error("Cannot save an empty draft.")
				return;
			}
			this.saveDraft();
		}, "slim p-6")

		this.element.append(DOM.createDiv("markdown-draft-footer flex justify-center", saveButton));

		this.createList();
	}

	private createList() {
		this.list.replaceChildren();
		for (const draft of MarkdownDraftStorage.getDrafts()) {
			const title = DOM.createDiv("markdown-draft-title", draft.name);

			const save = DocumentArrowDownIcon();
			save.addEventListener("click", () => {
				if (this.textarea.value.length === 0) {
					Toaster.error("Cannot save an empty draft.")
					return;
				}
				Dialog.confirm(() => {
					MarkdownDraftStorage.saveDraft({
						name: draft.name,
						content: this.textarea.value,
						timestamp: new Date(),
					}, true);
					this.createList();
				}, `Are you sure you want to override draft ${draft.name}?`);
			})

			const load = DocumentArrowUpIcon();
			load.addEventListener("click", () => {
				if (this.textarea.value.length > 0) {
					Dialog.confirm(() => {
						this.loadDraft(draft)
					}, "You will lose your current work by loading a draft.");
				} else {
					this.loadDraft(draft);
				}
			})
			const deleteButton = XMarkIcon();
			deleteButton.addEventListener("click", () => {
				Dialog.confirm(() => {
					MarkdownDraftStorage.deleteDraft(draft);
					this.createList();
				}, `Are you sure you want to delete draft ${draft.name}?`);
			});
			const characterCounts = MarkdownDraftManager.createCharacterCounts(draft.content);
			StaticTooltip.register(title, DOM.createDiv(null, [
				DOM.createDiv(null, draft.name),
				DOM.createDiv(null, Time.toLocaleString(draft.timestamp)),
				characterCounts]));
			StaticTooltip.register(save, "Save Draft");
			StaticTooltip.register(load, "Load Draft");
			StaticTooltip.register(deleteButton, "Delete Draft");
			this.list.append(title, save, load, deleteButton);
		}
	}

	private saveDraft() {
		Dialog.prompt((value) => {
			const draft: IDraft = {
				name: value,
				content: this.textarea.value,
				timestamp: new Date()
			};
			MarkdownDraftStorage.saveDraft(draft, false);
			this.createList();
		}, "Name new draft", "Draft name...");
	}

	private loadDraft(draft: IDraft) {
		this.textarea.value = draft.content;
		this.textarea.dispatchEvent(new Event("input", {bubbles: true}));
	}

	static createCharacterCounts(content: string): HTMLDivElement {
		const counts = [
			DOM.create("div", null, "Characters:"),
			DOM.create("div", null, content.length.toString()),
			DOM.create("div", null, "Words:"),
			DOM.create("div", null, (content.match(/\S+/g)?.length ?? 0).toString()),
			DOM.create("div", null, "Sentences:"),
			DOM.create("div", null, (content.match(/[^?!.][?!.]/g)?.length ?? 0).toString()),
			DOM.create("div", null, "Paragraphs:"),
			DOM.create("div", null, (content.match(/([^\r\n]+(\r?\n)?)+(?=(\r?\n){2,}|$)/g)?.length ?? 0).toString()),
		];

		return DOM.create("div", "markdown-taskbar-character-counts-grid", counts);
	}
}

class MarkdownDraftStorage {
	static getDrafts(): IDraft[] {
		return JSON.parse(localStorage.getItem(LocalStorageKeys.drafts)) ?? [];
	}

	static saveDraft(draft: IDraft, override: boolean) {
		let drafts = this.getDrafts();
		const exists = drafts.some(x => x.name === draft.name);
		if (exists && !override) {
			Toaster.error("Draft with given name already exists.");
			return;
		} else if (exists && override) {
			drafts = drafts.map(x => x.name !== draft.name ? x : draft);
		} else {
			drafts.push(draft);
		}
		localStorage.setItem(LocalStorageKeys.drafts, JSON.stringify(drafts));
	}

	static deleteDraft(draft: IDraft) {
		const drafts = this.getDrafts();
		localStorage.setItem(LocalStorageKeys.drafts, JSON.stringify(drafts.filter(x => x.name !== draft.name)));
	}
}
