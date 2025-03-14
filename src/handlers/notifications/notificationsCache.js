import {LocalStorageKeys} from "../../assets/localStorageKeys";

export class NotificationsCache {
	static #notificationRelationsInLocalStorage =
		LocalStorageKeys.notificationRelationsCache;
	static #deadLinkRelations = LocalStorageKeys.notificationDeadLinkRelationsCache;
	static cacheRelations(relations) {
		const relationsMap = this.#getRelations();
		for (const relation of relations) {
			relationsMap.set(relation.id, relation);
		}
		this.#setRelations(relationsMap);
	}

	static filterDeadLinks(activityIds) {
		const deadLinks =
			JSON.parse(localStorage.getItem(this.#deadLinkRelations)) ?? [];
		return activityIds.filter((id) => !deadLinks.includes(id));
	}

	static cacheDeadLinks(activityIds) {
		const deadLinks = new Set(
			JSON.parse(localStorage.getItem(this.#deadLinkRelations)),
		);
		for (const id of activityIds) {
			deadLinks.add(id);
		}
		localStorage.setItem(
			this.#deadLinkRelations,
			JSON.stringify(Array.from(deadLinks)),
		);
	}

	static getCachedRelations(activityIds) {
		const relations = this.#getRelations();
		const cachedIds = Array.from(relations.keys());
		const nonCachedIds = activityIds.filter(
			(id) => !cachedIds.includes(id),
		);
		return [
			Array.from(relations).map((mapEntry) => mapEntry[1]),
			nonCachedIds,
		];
	}

	static #getRelations() {
		const relations = new Map(
			JSON.parse(
				localStorage.getItem(
					this.#notificationRelationsInLocalStorage,
				),
			),
		);
		return relations;
	}

	static #setRelations(relations) {
		localStorage.setItem(
			this.#notificationRelationsInLocalStorage,
			JSON.stringify(Array.from(relations)),
		);
	}
}
