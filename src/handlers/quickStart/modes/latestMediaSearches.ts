import {IMediaSearchResult} from "../../../components/MediaSearchComponent";

export class LatestMediaSearches {
	private static localStorageKey = "void-verified-activity-search-media-cache";
	static add(media: IMediaSearchResult) {
		let mediaCache = this.get();
		if (mediaCache.find(x => x.id === media.id)) {
			return;
		}
		mediaCache.unshift(media);
		mediaCache = mediaCache.slice(0, 10);
		localStorage.setItem(this.localStorageKey, JSON.stringify(mediaCache));
	}

	static get(): IMediaSearchResult[] {
		return JSON.parse(localStorage.getItem(this.localStorageKey)) ?? [];
	}
}
