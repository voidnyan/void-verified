import {StaticSettings} from "../../utils/staticSettings";
import {DOM} from "../../utils/DOM";
import {InProgressEntry} from "../../components/InProgressEntry";
import {IMediaList} from "../../api/types/IMediaList";
import {Toaster} from "../../utils/toaster";
import {CogIcon, RefreshIcon} from "../../assets/icons";
import {IconButton} from "../../components/components";
import {
	InProgressCategoriesConfig,
	InProgressCategory,
	InProgressCategoryManager,
	InProgressMediaType
} from "../../components/InProgressCategoryManager";
import {IViewer} from "../../api/types/IViewer";
import {InProgressCategoryStorage} from "./inProgressCategoryStorage";
import {InProgressMediaListCache} from "./inProgressMediaListCache";
import {ActivityType} from "../../api/types/activityType";
import {CollapsibleContainer} from "../../components/collapsibleContainer";
import {CollapsibleHelper} from "../../utils/collapsibleHelper";

export class InProgressHandler {
	private static renderInProgress = false;
	private static anime: IMediaList[] = [];
	private static manga: IMediaList[] = [];
	private static viewer: IViewer;
	private static quickAccessContainer: HTMLDivElement;
	private static categories: InProgressCategoriesConfig;
	private static managerOpen = false;

	static async replaceInProgressSection(forceRerender = false){
		if (
			!StaticSettings.options.replaceInProgressEnabled.getValue() ||
			this.renderInProgress ||
			(this.hasRendered() && !forceRerender)
		) {
			return;
		}

		this.renderInProgress = true;

		try {
			const [anime, manga, viewer] = await InProgressMediaListCache.get(forceRerender);
			this.anime = anime;
			this.manga = manga;
			this.viewer = viewer;
			this.categories = InProgressCategoryStorage.load();
			this.removeMissingEntriesFromCategories();
			this.quickAccessContainer = DOM.getOrCreate(
				"div",
				"#quick-access quick-access",
			) as HTMLDivElement;

			this.render();
		} catch (error){
			Toaster.error("Failed to query in progress media.", error);
		} finally {
			this.renderInProgress = false;
		}
	}

	private static render() {
		const content = DOM.createDiv("in-progress-content");
		if (this.managerOpen) {
			const categoryManager = new InProgressCategoryManager({
				anime: this.anime,
				manga: this.manga,
				categories: this.categories,
				viewer: this.viewer,
				onChange: categories => {
					this.categories = categories;
					this.persistAndRender();
				}
			});
			content.append(this.createManagerSection(categoryManager.element));
		} else {
			const sections = [
				...this.createAnimeSections(),
				...this.createMangaSections(this.manga, this.categories.Manga)
			];
			const toggleButton = this.createManagerToggleButton();
			const refreshButton = this.createRefreshButton();
			sections[0]?.querySelector(".section-header")
				?.append(DOM.create("span", null, [refreshButton, toggleButton]));
			content.append(...sections);
		}

		const existingContent = this.quickAccessContainer.querySelector(".void-in-progress-content");
		if (existingContent) {
			this.quickAccessContainer.replaceChild(content, existingContent);
			this.removeDefaultListPreviews();
			return;
		}
		this.quickAccessContainer.append(content);
		this.removeDefaultListPreviews();
	}

	private static removeDefaultListPreviews() {
		document.querySelector(".list-previews")?.remove();
	}

	private static hasRendered() {
		return document.querySelector(".void-in-progress-content") !== null;
	}

	private static createAnimeSections() {
		const sections: HTMLDivElement[] = [];
		const customCategoryIds = this.categories.Anime.map(x => x.mediaIds).flat();

		for (const category of this.categories.Anime) {
			const entries = this.anime.filter(x => category.mediaIds.includes(x.media.id));
			if (entries.length === 0) {
				continue;
			}
			sections.push(this.createInProgressSection(entries, category.title));
		}

		let airingEntries = this.anime.filter(item => this.isAiring(item));
		if (!this.categories.includeCustomCategoryEntriesInAiring) {
			airingEntries = airingEntries.filter(item => !customCategoryIds.includes(item.media.id));
		}

		let autoCategoryIds: number[] = [];
		if (this.categories.autoAiringCategory && airingEntries.length > 0) {
			sections.push(this.createInProgressSection(airingEntries, "Airing"));
			autoCategoryIds.push(...airingEntries.map(item => item.media.id));
		}

		let rewatchingEntries = this.anime.filter(item => item.status === ActivityType.REPEATING);
		if (!this.categories.includeCustomCategoryEntriesInAiring) {
			rewatchingEntries = rewatchingEntries.filter(item => !customCategoryIds.includes(item.media.id));
		}

		if (this.categories.autoRewatchingCategory && rewatchingEntries.length > 0) {
			sections.push(this.createInProgressSection(rewatchingEntries, "Rewatching"));
			autoCategoryIds.push(...rewatchingEntries.map(item => item.media.id));
		}

		const excludedIds = [...customCategoryIds, ...autoCategoryIds];
		const remainingEntries = this.anime.filter(x => !excludedIds.includes(x.media.id));
		if (remainingEntries.length > 0) {
			sections.push(this.createInProgressSection(remainingEntries, "Anime In Progress"));
		}

		return sections;
	}

	private static createMangaSections(items: IMediaList[], categories: InProgressCategory[]) {
		const sections: HTMLDivElement[] = [];
		const customCategoryIds = this.categories.Manga.map(x => x.mediaIds).flat();

		for (const category of categories) {
			const entries = items.filter(x => category.mediaIds.includes(x.media.id));
			if (entries.length === 0) {
				continue;
			}
			sections.push(this.createInProgressSection(entries, category.title));
		}

		let rereadingIds = this.manga.filter(item => item.status === ActivityType.REPEATING);
		if (!this.categories.includeCustomCategoryEntriesInAiring) {
			rereadingIds = rereadingIds.filter(item => !customCategoryIds.includes(item.media.id));
		}

		const autoCategoryIds: number[] = [];
		if (this.categories.autoRewatchingCategory && rereadingIds.length > 0) {
			sections.push(this.createInProgressSection(rereadingIds, "Rereading"));
			autoCategoryIds.push(...rereadingIds.map(item => item.media.id));
		}

		const excludedIds = [...customCategoryIds, ...autoCategoryIds];
		const remainingEntries = items.filter(x => !excludedIds.includes(x.media.id));
		if (remainingEntries.length === 0) return sections;

		sections.push(this.createInProgressSection(remainingEntries, `Manga In Progress`));
		return sections;
	}

	private static isAiring(item: IMediaList) {
		return item.media.airingSchedule.nodes.length > 0;
	}

	private static createManagerSection(manager: HTMLDivElement) {
		const wrapper = DOM.createDiv("in-progress-wrapper");
		const sectionHeader = DOM.createDiv(".section-header", [
			DOM.create("h2", null, "In Progress Categories"),
			DOM.create("span", null, this.createManagerToggleButton())
		]);

		wrapper.append(sectionHeader, manager);
		return wrapper;
	}

	private static createManagerToggleButton() {
		const toggleButton = IconButton(CogIcon(), (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			this.managerOpen = !this.managerOpen;
			this.render();
		});
		toggleButton.setAttribute("title", "Manage in progress categories");
		return toggleButton;
	}

	private static createRefreshButton() {
		const refreshButton = IconButton(RefreshIcon(), (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			this.replaceInProgressSection(true);
		});
		refreshButton.setAttribute("title", "Refresh in progress entries.");
		return refreshButton;
	}

	private static createInProgressSection(items: IMediaList[], title: string) {
		let entries = [...items];
		entries = entries.sort((a, b) => {
			const scheduleA = a.media.airingSchedule.nodes[0];
			const scheduleB = b.media.airingSchedule.nodes[0];
			if (!scheduleA && !scheduleB) {
				return 0;
			}
			if (!scheduleA) {
				return 1;
			}
			if (!scheduleB) {
				return -1;
			}
			return scheduleA.timeUntilAiring - scheduleB.timeUntilAiring;
		})
		const container = DOM.createDiv("in-progress-container");

		for (const mediaList of entries) {
			const item = new InProgressEntry(mediaList, {
				onProgressSaved: (entry, progress, completed) => {
					InProgressMediaListCache.updateProgress(entry.media.id, progress, completed);
				}
			});
			container.append(item.element);
		}

		const wrapper = DOM.createDiv("in-progress-wrapper");
		const sectionHeader = DOM.createDiv(".section-header", DOM.create("h2", null, title))

		wrapper.append(sectionHeader, container);

		CollapsibleHelper.makeCollapsible(container, sectionHeader, `in-progress-${title}`);

		return wrapper;
	}

	private static persistAndRender() {
		InProgressCategoryStorage.save(this.categories);
		this.render();
	}

	private static removeMissingEntriesFromCategories() {
		const animeIds = new Set(this.anime.map(item => item.media.id));
		const mangaIds = new Set(this.manga.map(item => item.media.id));
		const removedAnimeEntries = this.removeMissingEntriesFromCategoryType("Anime", animeIds);
		const removedMangaEntries = this.removeMissingEntriesFromCategoryType("Manga", mangaIds);

		if (removedAnimeEntries || removedMangaEntries) {
			InProgressCategoryStorage.save(this.categories);
		}
	}

	private static removeMissingEntriesFromCategoryType(type: InProgressMediaType, currentIds: Set<number>) {
		let removedEntries = false;
		this.categories[type] = this.categories[type]
			.map(category => {
				const mediaIds = category.mediaIds.filter(mediaId => currentIds.has(mediaId));
				if (mediaIds.length !== category.mediaIds.length) {
					removedEntries = true;
				}
				return {
					...category,
					mediaIds
				};
			})
			.filter(category => {
				const shouldKeep = category.mediaIds.length > 0;
				if (!shouldKeep) {
					removedEntries = true;
				}
				return shouldKeep;
			});

		return removedEntries;
	}
}
