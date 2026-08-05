import {
	createInProgressCategoryId,
	InProgressCategoriesConfig,
	InProgressCategory
} from "../../components/InProgressCategoryManager";
import {LocalStorageKeys} from "../../assets/localStorageKeys";
import {Toaster} from "../../utils/toaster";

export
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
