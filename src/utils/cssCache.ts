interface CachedItem {
	username: string,
	css: string,
	expires: Date | string,
	userColor: string
}

export class CssCache {
	static #localStorage = "void-verified-css-cache";

	static getCss(username: string) {
		return this.get(username)?.css;
	}

	static get(username: string) {
		const cache = this.#getCache();
		const item = cache.find(c => c.username === username);
		if (!item) {
			return null;
		}
		if (new Date() > new Date(item.expires)) {
			this.#setCache(cache.filter(c => c.username !== username));
			return null;
		}
		return item;
	}

	static set(username: string, css: string, userColor: string) {
		const expires = new Date();
		expires.setMinutes(expires.getMinutes() + 30);
		const item = {
			username,
			css,
			expires,
			userColor
		}
		const cache = this.#getCache();
		const exists = cache.some(c => c.username === username);
		if (exists) {
			this.#setCache(cache.map(c => c.username !== username ? c : item));
		} else {
			cache.push(item);
			this.#setCache(cache);
		}
	}

	static clearExpired() {
		const cache = this.#getCache();
		const currentTime = new Date();
		this.#setCache(cache.filter(c => currentTime < new Date(c.expires)));
	}

	static clear(username: string) {
		const cache = this.#getCache();
		this.#setCache(cache.filter(c => c.username !== username));
	}

	static #getCache() {
		const cache = JSON.parse(localStorage.getItem(this.#localStorage)) as CachedItem[];
		return cache ?? [] as CachedItem[];
	}
	static #setCache(value: CachedItem[]) {
		localStorage.setItem(this.#localStorage, JSON.stringify(value));
	}
}
