import {IMediaList} from "../api/types/IMediaList";
import {Checkbox, SettingLabel} from "./components";
import {DOM} from "../utils/DOM";
import {Toaster} from "../utils/toaster";

export type InProgressMediaType = "Anime" | "Manga";

export interface InProgressCategory {
	id: string;
	mediaIds: number[];
	title: string;
}

export interface InProgressCategoriesConfig {
	Anime: InProgressCategory[];
	Manga: InProgressCategory[];
	autoAiringCategory: boolean;
	includeCustomCategoryEntriesInAiring: boolean;
}

interface CategoryEditorState {
	type: InProgressMediaType;
	editingId: string | null;
}

interface InProgressCategoryManagerOptions {
	anime: IMediaList[];
	manga: IMediaList[];
	categories: InProgressCategoriesConfig;
	onChange: (categories: InProgressCategoriesConfig) => void;
}

interface NavigatorWithUserAgentData extends Navigator {
	userAgentData?: {
		platform?: string;
	};
}

export class InProgressCategoryManager {
	private anime: IMediaList[];
	private manga: IMediaList[];
	private categories: InProgressCategoriesConfig;
	private onChange: (categories: InProgressCategoriesConfig) => void;
	private categoryEditorState: CategoryEditorState = {
		type: "Anime",
		editingId: null
	};
	element: HTMLDivElement;

	constructor(options: InProgressCategoryManagerOptions) {
		this.anime = options.anime;
		this.manga = options.manga;
		this.categories = options.categories;
		this.onChange = options.onChange;
		this.element = DOM.createDiv("in-progress-category-manager");
		this.render();
	}

	private render() {
		const editor = this.createCategoryEditor();
		const airingSettings = this.createAiringSettings();
		const lists = DOM.createDiv("in-progress-category-lists", [
			this.createCategoryList("Anime"),
			this.createCategoryList("Manga")
		]);

		this.element.replaceChildren(editor, airingSettings, lists);
	}

	private createAiringSettings() {
		const container = DOM.createDiv("in-progress-category-settings");
		const autoAiringCategory = SettingLabel(
			"Automatically create an Airing anime category.",
			Checkbox(this.categories.autoAiringCategory, () => {
				this.categories.autoAiringCategory = !this.categories.autoAiringCategory;
				this.onChange(this.categories);
			})
		);
		const includeCustomCategoryEntriesInAiring = SettingLabel(
			"Include custom category entries in Airing.",
			Checkbox(this.categories.includeCustomCategoryEntriesInAiring, () => {
				this.categories.includeCustomCategoryEntriesInAiring = !this.categories.includeCustomCategoryEntriesInAiring;
				this.onChange(this.categories);
			})
		);

		container.append(autoAiringCategory, includeCustomCategoryEntriesInAiring);
		return container;
	}

	private createCategoryEditor() {
		const typeSelect = DOM.create<HTMLSelectElement>("select", "in-progress-category-field");
		for (const type of ["Anime", "Manga"] as InProgressMediaType[]) {
			const option = DOM.create<HTMLOptionElement>("option", null, type, {value: type});
			option.selected = type === this.categoryEditorState.type;
			typeSelect.append(option);
		}

		const editingCategory = this.getEditingCategory();
		const titleInput = DOM.create<HTMLInputElement>("input", "in-progress-category-field", null, {
			placeholder: "Category name",
			value: editingCategory?.title ?? ""
		});
		titleInput.type = "text";

		const mediaSelect = DOM.create<HTMLSelectElement>("select", "in-progress-category-media-select");
		mediaSelect.multiple = true;
		mediaSelect.size = Math.min(Math.max(this.getItems(this.categoryEditorState.type).length, 4), 10);
		const selectedIds = editingCategory?.mediaIds ?? [];
		for (const item of this.getItems(this.categoryEditorState.type)) {
			const option = DOM.create<HTMLOptionElement>("option", null, item.media.title.userPreferred, {
				value: item.media.id.toString()
			});
			option.selected = selectedIds.includes(item.media.id);
			mediaSelect.append(option);
		}
		const multiSelectNote = DOM.createDiv("in-progress-category-multi-select-note", `Hold ${this.getMultiSelectModifierKey()} to select multiple entries.`);

		typeSelect.addEventListener("change", () => {
			this.categoryEditorState = {
				type: typeSelect.value as InProgressMediaType,
				editingId: null
			};
			this.render();
		});

		const saveButton = DOM.create<HTMLButtonElement>("button", "in-progress-category-button", editingCategory ? "Save Category" : "Create Category");
		saveButton.addEventListener("click", () => {
			const title = titleInput.value.trim();
			const mediaIds = Array.from(mediaSelect.selectedOptions).map(option => Number(option.value));

			if (!title) {
				Toaster.error("Category name is required.");
				return;
			}

			if (mediaIds.length === 0) {
				Toaster.error("Select at least one media entry.");
				return;
			}

			this.saveCategory(this.categoryEditorState.type, {
				id: editingCategory?.id ?? createInProgressCategoryId(),
				title,
				mediaIds
			});
			this.categoryEditorState.editingId = null;
			this.onChange(this.categories);
		});

		const cancelButton = DOM.create<HTMLButtonElement>("button", "in-progress-category-button in-progress-category-button-secondary", "Cancel");
		cancelButton.hidden = !editingCategory;
		cancelButton.addEventListener("click", () => {
			this.categoryEditorState.editingId = null;
			this.render();
		});

		const actions = DOM.createDiv("in-progress-category-actions", [saveButton, cancelButton]);
		return DOM.createDiv("in-progress-category-editor", [
			typeSelect,
			titleInput,
			mediaSelect,
			multiSelectNote,
			actions
		]);
	}

	private createCategoryList(type: InProgressMediaType) {
		const categories = this.categories[type];
		const container = DOM.createDiv("in-progress-category-list");
		container.append(DOM.create("h3", null, type));

		if (categories.length === 0) {
			container.append(DOM.createDiv("in-progress-category-empty", "No categories"));
			return container;
		}

		for (const category of categories) {
			const count = category.mediaIds.length;
			const title = DOM.createDiv("in-progress-category-list-title", category.title);
			const meta = DOM.createDiv("in-progress-category-list-meta", `${count} ${count === 1 ? "entry" : "entries"}`);
			const editButton = DOM.create<HTMLButtonElement>("button", "in-progress-category-small-button", "Edit");
			const deleteButton = DOM.create<HTMLButtonElement>("button", "in-progress-category-small-button in-progress-category-danger-button", "Delete");

			editButton.addEventListener("click", () => {
				this.categoryEditorState = {
					type,
					editingId: category.id
				};
				this.render();
			});

			deleteButton.addEventListener("click", () => {
				this.categories[type] = this.categories[type].filter(x => x.id !== category.id);
				if (this.categoryEditorState.editingId === category.id) {
					this.categoryEditorState.editingId = null;
				}
				this.onChange(this.categories);
			});

			container.append(DOM.createDiv("in-progress-category-list-item", [
				DOM.createDiv(null, [title, meta]),
				DOM.createDiv("in-progress-category-list-actions", [editButton, deleteButton])
			]));
		}

		return container;
	}

	private getItems(type: InProgressMediaType) {
		return type === "Anime" ? this.anime : this.manga;
	}

	private getMultiSelectModifierKey() {
		return this.isMac() ? "Command" : "Ctrl";
	}

	private isMac() {
		const userAgentData = (navigator as NavigatorWithUserAgentData).userAgentData;
		if (userAgentData?.platform) {
			return userAgentData.platform.toLowerCase().includes("mac");
		}
		return navigator.userAgent.toLowerCase().includes("mac");
	}

	private getEditingCategory() {
		if (!this.categoryEditorState.editingId) {
			return null;
		}
		return this.categories[this.categoryEditorState.type]
			.find(x => x.id === this.categoryEditorState.editingId) ?? null;
	}

	private saveCategory(type: InProgressMediaType, category: InProgressCategory) {
		const categories = this.categories[type];
		const index = categories.findIndex(x => x.id === category.id);
		if (index === -1) {
			categories.push(category);
			return;
		}
		categories[index] = category;
	}
}

export function createInProgressCategoryId() {
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
