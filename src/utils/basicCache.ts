export class BasicCache<T> {
	private localStorageKey: string;
	private cacheTimeInMilliseconds: number;

	constructor(localStorageKey: string, cacheTimeInMilliseconds: number) {
		this.localStorageKey = localStorageKey;
		this.cacheTimeInMilliseconds = cacheTimeInMilliseconds;
	}

	getItem(predicate: (item: T) => boolean): T | null {
		const cache = this.getCache();
		const entry = cache.find(c => predicate(c.item));

		if (!entry) {
			return null;
		}

		const expiresAt = new Date(entry.cachedAt);
		expiresAt.setMilliseconds(expiresAt.getMilliseconds() + this.cacheTimeInMilliseconds);
		console.log(expiresAt, entry.item);
		if (expiresAt < new Date()) {
			this.setCache(cache.filter(c => c !== entry));
			return null;
		}

		return entry.item;
	}

	setItem(item: T): void {
		const cache = this.getCache();
		cache.push(new CacheItem(item));
		this.setCache(cache);
	}

	private getCache(): CacheItem<T>[] {
		const raw = localStorage.getItem(this.localStorageKey);
		if (!raw) return [];

		return JSON.parse(raw).map(
			(x: any) => new CacheItem<T>(x.item, new Date(x.cachedAt))
		);
	}

	private setCache(cache: CacheItem<T>[]): void {
		localStorage.setItem(this.localStorageKey, JSON.stringify(cache));
	}
}

class CacheItem<T> {
	item: T;
	cachedAt: Date;

	constructor(item: T, cachedAt?: Date) {
		this.item = item;
		this.cachedAt = cachedAt ?? new Date();
	}
}
