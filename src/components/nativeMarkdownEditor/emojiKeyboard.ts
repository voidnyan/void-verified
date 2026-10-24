import {BasicCache} from "../../utils/basicCache";
import {DOM} from "../../utils/DOM";
import {GifKeyboard, IconButton} from "../components";
import {Common} from "../../utils/common";
import {StaticTooltip} from "../../utils/staticTooltip";
import {LocalStorageCacheKeys} from "../../assets/localStorageKeys";
import {InputComponent} from "../inputComponent";
import {Debouncer} from "../../utils/debouncer";
import {FuzzyMatch} from "../../utils/fuzzyMatch";

interface IEmojiCache {
	id: string;
	value: IEmojiCategory[];
}

interface IEmoji {
	name: string;
	value: string;
	tags: string[];
}

interface IEmojiCategory {
	name: string;
	emojis: IEmoji[];
}

interface IFrequentlyUsedEmoji extends IEmoji{
	lastUsed: number;
	count: number;
}

interface ISearchableEmoji extends IEmoji {
	searchText: string;
}

class FrequentlyUsedEmojis {
	emojis = new Map<string, IFrequentlyUsedEmoji>();

	constructor() {
		GM.getValue(LocalStorageCacheKeys.frequentlyUsedEmojis).then(async (storedEmojis) => {
			const emojis: IFrequentlyUsedEmoji[] = JSON.parse(storedEmojis?.toString() ?? "[]");
			const maxAge = 60 * 24 * 60 * 60 * 1000;
			const now = Date.now();
			for (const emoji of emojis) {
				if (now - emoji.lastUsed > maxAge || emoji.count < 0.1)
					continue;
				this.emojis.set(emoji.name, emoji);
			}
			await this.save();
		});
	}

	async increase(emoji: IEmoji) {
		const frequentlyUsedEmoji = this.emojis.get(emoji.name);

		const now = Date.now();
		if (!frequentlyUsedEmoji) {
			this.emojis.set(emoji.name, {
				...emoji,
				count: 1,
				lastUsed: now
			});
			await this.save();
			return;
		}
		const ageDays = (now - frequentlyUsedEmoji.lastUsed) / 86400000;
		frequentlyUsedEmoji.count =
			frequentlyUsedEmoji.count * Math.pow(0.5, ageDays / 7) + 1;

		frequentlyUsedEmoji.lastUsed = now;
		await this.save();
	}

	private async save(){
		await GM.setValue(LocalStorageCacheKeys.frequentlyUsedEmojis, JSON.stringify([...this.emojis.values()]));
	}
}

export class EmojiKeyboard {
	private static emojiCache = new BasicCache<IEmojiCache>("void-emoji-data", 365 * 24 * 60 * 1000);
	private static emojiCategories: IEmojiCategory[];
	private static allEmojis: ISearchableEmoji[];
	private static frequentlyUsed = new FrequentlyUsedEmojis();

	private readonly markdownEditor = HTMLDivElement;
	element: HTMLDivElement;
	private body: HTMLDivElement;
	private header: HTMLDivElement;
	private rendered = false;
	private renderedCategories: HTMLDivElement[] = [];

	constructor(markdownEditor: HTMLDivElement) {
		// @ts-ignore
		this.markdownEditor = markdownEditor;
		this.element = GifKeyboard(this.createKeyboardHeader()) as HTMLDivElement;
		this.body = this.element.querySelector(".void-gif-keyboard-list") as HTMLDivElement;
		this.element.classList.add("void-emoji-keyboard");
		this.createKeyboardControls();
	}

	private createKeyboardHeader() {
		this.header = DOM.create("div", "gif-keyboard-header");
		return this.header;
	}

	private createKeyboardControls() {
		const container = this.element.querySelector(".void-gif-keyboard-top-controls");
		const filterInput = new InputComponent(null, "Search...");
		const debouncer = new Debouncer();
		filterInput.addKeyUpListener((event) => {
			debouncer.debounce(() => {
				this.renderSearchResults(event.target.value);
			}, 100);
		});
		container.append(filterInput.element);
	}

	private renderSearchResults(filter: string) {
		if (filter.length === 0) {
			this.body.replaceChildren(...this.renderedCategories);
			return;
		}
		const results: IEmojiCategory = {
			name: "Search results",
			emojis: EmojiKeyboard.allEmojis.filter(x => FuzzyMatch.match(filter, x.searchText))
		}
		this.body.replaceChildren(this.createCategory(results, null, false));
	}

	renderEmojiList() {
		if (!this.element || !this.markdownEditor || this.rendered) {
			return;
		}

		this.rendered = true;

		const frequentlyUsedCategory: IEmojiCategory = {
			name: "Frequently Used",
			emojis: [...EmojiKeyboard.frequentlyUsed.emojis.values()]
				.sort((a, b) => b.count - a.count).slice(0, 30)
		}
		if (frequentlyUsedCategory.emojis.length > 0)
			this.renderedCategories.push(this.createCategory(frequentlyUsedCategory, "🕓"));

		for (const emojiCategory of EmojiKeyboard.emojiCategories) {
			this.renderedCategories.push(this.createCategory(emojiCategory));
		}
		this.body.replaceChildren(...this.renderedCategories);
	}

	private createCategory(category: IEmojiCategory, categoryButtonOverride: string = null, addCategoryButton = true) {
		const container = DOM.createDiv("emoji-category");
		const categoryHeader = DOM.create("h2", "emoji-list-header", category.name);
		container.append(categoryHeader);

		if (addCategoryButton) {
			const categoryButton = IconButton(categoryButtonOverride ?? category.emojis[0].value, () => {
				Common.scrollIntoView(container, this.body.parentElement);
			});

			this.header.append(categoryButton);
		}

		const list = DOM.createDiv("emoji-list");
		container.append(list);

		for (const emoji of category.emojis) {
			const emojiButton = DOM.createDiv("emoji-button", emoji.value);
			emojiButton.addEventListener("click", async () => {
				this.insertEmoji(emoji.value);
				await EmojiKeyboard.frequentlyUsed.increase(emoji);
			});
			StaticTooltip.register(emojiButton, emoji.name);
			list.append(emojiButton);
		}
		return container;
	}

	private insertEmoji(emoji: string) {
		// @ts-ignore
		const textarea = this.markdownEditor.parentElement.querySelector<HTMLTextAreaElement>("textarea");
		textarea.setRangeText(
			this.emojiToHtml(emoji),
			textarea.selectionStart,
			textarea.selectionEnd,
			"end"
		);
		textarea.dispatchEvent(new Event('input', {bubbles: true}));
	}

	private emojiToHtml(emoji: string) {
		return [...emoji]
			.map(char => `&#${char.codePointAt(0)};`)
			.join("");
	}

	static async loadEmojis() {
		const id = "emojis";
		const cachedEmojis = await this.emojiCache.getItem(x => x.id == id);

		if (cachedEmojis) {
			this.emojiCategories = cachedEmojis.value;
			this.createSearchableEmojisList();
			return;
		}

		const emojis = await this.loadEmojiCategories();

		 const item = {
			 id: id,
			 value: emojis
		 };

		 await this.emojiCache.setItem(item);
		 this.emojiCategories = item.value;
		 this.createSearchableEmojisList();
	}

	private static createSearchableEmojisList() {
		this.allEmojis = this.emojiCategories.flatMap(category =>
			category.emojis.map(emoji => ({
				...emoji,
				category: category.name,
				searchText: [
					emoji.name,
					...(emoji.tags ?? [])
				].join(" ").toLowerCase()
			}))
		);
	}

	static async loadEmojiCategories() {
		const cdn = "https://cdn.jsdelivr.net/npm/emojibase-data@17.0.0/en";
		const [data, messages] = await Promise.all([
			fetch(`${cdn}/compact.json`).then(r => r.json()),
			fetch(`${cdn}/messages.json`).then(r => r.json())
		]);

		return messages.groups
			.filter(group => group.key !== "component")
			.sort((a, b) => a.order - b.order)
			.map(group => ({
				name: group.message,
				emojis: data
					.filter(emoji => emoji.group === group.order)
					.map(e => ({
						name: e.label,
						value: e.unicode,
						tags: e.tags ?? []
					}))
			}))
			.filter(group => group.emojiCategories.length > 0);
	}
}
