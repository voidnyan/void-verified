import {StaticSettings} from "../utils/staticSettings";
import {AnilistAPI} from "../api/anilistAPI";
import {DOM} from "../utils/DOM";
import {InProgressEntry} from "../components/InProgressEntry";
import {IMediaList} from "../api/types/IMediaList";
import {Toaster} from "../utils/toaster";
import {LocalStorageCacheKeys, LocalStorageKeys} from "../assets/localStorageKeys";
import {CogIcon, ListBulletIcon, RefreshIcon} from "../assets/icons";
import {IconButton} from "../components/components";
import {CacheTimes} from "../assets/cacheTimes";
import {
	createInProgressCategoryId,
	InProgressCategoriesConfig,
	InProgressCategory,
	InProgressCategoryManager,
	InProgressMediaType
} from "../components/InProgressCategoryManager";
import {ListSettingsManager} from "../components/listSettingsManager";
import {IViewer} from "../api/types/IViewer";

export class InProgressHandler {
	private static renderInProgress = false;
	private static anime: IMediaList[] = [];
	private static manga: IMediaList[] = [];
	private static viewer: IViewer;
	private static quickAccessContainer: HTMLDivElement;
	private static categories: InProgressCategoriesConfig;
	private static activeTab = 0;

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
		const categoryManager = new InProgressCategoryManager({
			anime: this.anime,
			manga: this.manga,
			categories: this.categories,
			onChange: categories => {
				this.categories = categories;
				this.persistAndRender();
			}
		});
		const content = DOM.createDiv("in-progress-content");
		if (this.activeTab === 1) {
			content.append(this.createManagerSection(categoryManager.element));
		} else if (this.activeTab === 2) {
			content.append(this.createListSettingsSection());
		} else {
			const sections = [
				...this.createAnimeSections(),
				...this.createMangaSections(this.manga, this.categories.Manga)
			];
			const managerToggleButton = this.createManagerToggleButton();
			const refreshButton = this.createRefreshButton();
			const activitySettingsButton = this.createListSettingsButton();
			sections[0]?.querySelector(".section-header")
				?.append(DOM.create("span", null, [refreshButton, activitySettingsButton, managerToggleButton]));
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

		const airingIds = airingEntries.map(item => item.media.id);
		if (this.categories.autoAiringCategory && airingEntries.length > 0) {
			sections.push(this.createInProgressSection(airingEntries, "Airing"));
		}

		const excludedIds = this.categories.autoAiringCategory
			? [...customCategoryIds, ...airingIds]
			: customCategoryIds;
		const remainingEntries = this.anime.filter(x => !excludedIds.includes(x.media.id));
		if (remainingEntries.length > 0) {
			sections.push(this.createInProgressSection(remainingEntries, "Anime In Progress"));
		}

		return sections;
	}

	private static createMangaSections(items: IMediaList[], categories: InProgressCategory[]) {
		const sections: HTMLDivElement[] = [];

		for (const category of categories) {
			const entries = items.filter(x => category.mediaIds.includes(x.media.id));
			if (entries.length === 0) {
				continue;
			}
			sections.push(this.createInProgressSection(entries, category.title));
		}

		const allIds = categories.map(x => x.mediaIds).flat();

		const remainingEntries = items.filter(x => !allIds.includes(x.media.id));
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
		const toggleButton = IconButton(CogIcon(), () => {
			this.activeTab = this.activeTab !== 1 ? 1 : 0;
			this.render();
		});
		toggleButton.setAttribute("title", "Manage in progress categories");
		return toggleButton;
	}

	private static createListSettingsSection() {
		const wrapper = DOM.createDiv("in-progress-wrapper");
		const sectionHeader = DOM.createDiv(".section-header", [
			DOM.create("h2", null, "List Settings"),
			DOM.create("span", null, this.createListSettingsButton())
		]);

		const listSettingsManager = new ListSettingsManager(this.viewer);

		wrapper.append(sectionHeader, listSettingsManager.element);
		return wrapper;
	}

	private static createListSettingsButton() {
		const button = IconButton(ListBulletIcon(), () => {
			this.activeTab = this.activeTab !== 2 ? 2 : 0;
			this.render();
		})
		button.setAttribute("Title", "List activity settings");
		return button;
	}

	private static createRefreshButton() {
		const refreshButton = IconButton(RefreshIcon(), () => {
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

interface InProgressMediaListCacheItem {
	anime: IMediaList[];
	manga: IMediaList[];
	viewer: IViewer;
	cachedAt: string;
}

class InProgressMediaListCache {
	static async get(forceReQuery: boolean): Promise<[IMediaList[], IMediaList[], IViewer]> {
		const cachedLists = this.getCachedLists();
		if (cachedLists && !forceReQuery) {
			return [cachedLists.anime, cachedLists.manga, cachedLists.viewer];
		}

		const [anime, manga, viewer] = await AnilistAPI.getInProgressMediaLists();
		this.save(anime, manga, viewer);
		return [anime, manga, viewer];
	}

	private static getCachedLists() {
		const raw = localStorage.getItem(LocalStorageCacheKeys.inProgressMediaLists);
		if (!raw) {
			return null;
		}

		try {
			const cache = JSON.parse(raw) as InProgressMediaListCacheItem;
			if (!Array.isArray(cache?.anime) || !Array.isArray(cache?.manga) || !cache.viewer || !cache.cachedAt) {
				localStorage.removeItem(LocalStorageCacheKeys.inProgressMediaLists);
				return null;
			}

			const expiresAt = new Date(cache.cachedAt);
			expiresAt.setMilliseconds(expiresAt.getMilliseconds() + CacheTimes.inProgressMediaLists);
			if (expiresAt < new Date()) {
				localStorage.removeItem(LocalStorageCacheKeys.inProgressMediaLists);
				return null;
			}

			return cache;
		} catch {
			localStorage.removeItem(LocalStorageCacheKeys.inProgressMediaLists);
			return null;
		}
	}

	private static save(anime: IMediaList[], manga: IMediaList[], viewer: IViewer) {
		localStorage.setItem(LocalStorageCacheKeys.inProgressMediaLists, JSON.stringify({
			anime,
			manga,
			viewer,
			cachedAt: new Date()
		}));
	}

	static updateProgress(mediaId: number, progress: number, completed: boolean) {
		const cache = this.getCachedLists();
		if (!cache) {
			return;
		}

		cache.anime = this.updateListProgress(cache.anime, mediaId, progress, completed);
		cache.manga = this.updateListProgress(cache.manga, mediaId, progress, completed);
		localStorage.setItem(LocalStorageCacheKeys.inProgressMediaLists, JSON.stringify(cache));
	}

	private static updateListProgress(items: IMediaList[], mediaId: number, progress: number, completed: boolean) {
		if (completed) {
			return items.filter(item => item.media.id !== mediaId);
		}

		return items.map(item => {
			if (item.media.id !== mediaId) {
				return item;
			}
			return {
				...item,
				progress
			};
		});
	}
}

class InProgressCategoryStorage {
	static load(): InProgressCategoriesConfig {
		const fallback = {
			Anime: [],
			Manga: [],
			autoAiringCategory: true,
			includeCustomCategoryEntriesInAiring: false
		};

		try {
			const categories = JSON.parse(localStorage.getItem(LocalStorageKeys.inProgressCategories));
			return {
				Anime: this.normalizeCategories(categories?.Anime),
				Manga: this.normalizeCategories(categories?.Manga),
				autoAiringCategory: categories?.autoAiringCategory ?? fallback.autoAiringCategory,
				includeCustomCategoryEntriesInAiring: categories?.includeCustomCategoryEntriesInAiring ?? fallback.includeCustomCategoryEntriesInAiring
			};
		} catch (error) {
			Toaster.error("Failed to load in progress categories.", error);
			return fallback;
		}
	}

	static save(categories: InProgressCategoriesConfig) {
		localStorage.setItem(LocalStorageKeys.inProgressCategories, JSON.stringify(categories));
	}

	private static normalizeCategories(categories: InProgressCategory[]) {
		if (!Array.isArray(categories)) {
			return [];
		}

		return categories
			.filter(category => category?.title && Array.isArray(category.mediaIds))
			.map(category => ({
				id: category.id ?? createInProgressCategoryId(),
				title: category.title,
				mediaIds: category.mediaIds.filter(mediaId => Number.isInteger(mediaId))
			}));
	}
}
