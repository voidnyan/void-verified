import {IViewer} from "../../api/types/IViewer";
import {IMediaList} from "../../api/types/IMediaList";
import {AnilistAPI} from "../../api/anilistAPI";
import {LocalStorageCacheKeys} from "../../assets/localStorageKeys";
import {CacheTimes} from "../../assets/cacheTimes";


interface InProgressMediaListCacheItem {
	anime: IMediaList[];
	manga: IMediaList[];
	viewer: IViewer;
	cachedAt: string;
}


export class InProgressMediaListCache {
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

	static updateViewer(viewer: IViewer) {
		const cache = this.getCachedLists();
		if (!cache) {
			return;
		}
		cache.viewer = viewer;
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
