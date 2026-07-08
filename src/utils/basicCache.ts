export class BasicCache<T> {
	private readonly localStorageKey: string;
	private cacheTimeInMilliseconds: number;

	constructor(localStorageKey: string, cacheTimeInMilliseconds: number) {
		this.localStorageKey = localStorageKey;
		this.cacheTimeInMilliseconds = cacheTimeInMilliseconds;
	}

	async getItem(predicate: (item: T) => boolean): Promise<T | null> {
		const cache = await this.getCache();
		const entry = cache.find(c => predicate(c.item));

		if (!entry) {
			return null;
		}

		const expiresAt = new Date(entry.cachedAt);
		expiresAt.setMilliseconds(expiresAt.getMilliseconds() + this.cacheTimeInMilliseconds);
		if (expiresAt < new Date()) {
			await this.setCache(cache.filter(c => c !== entry));
			return null;
		}

		return entry.item;
	}

	async setItem(item: T): Promise<void> {
		const cache = await this.getCache();
		cache.push(new CacheItem(item));
		await this.setCache(cache);
	}

	private async getCache(): Promise<CacheItem<T>[]> {
		const raw = await GM.getValue(this.localStorageKey, null);
		if (!raw) return [];

		return JSON.parse(raw).map(
			(x: any) => new CacheItem<T>(x.item, new Date(x.cachedAt))
		);
	}

	private async setCache(cache: CacheItem<T>[]): Promise<void> {
		await GM.setValue(this.localStorageKey, JSON.stringify(cache));
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
