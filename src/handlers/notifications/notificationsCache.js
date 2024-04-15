export class NotificationsCache {
	static #notificationRelationsInSessionStorage =
		"void-verified-notification-relations";
	static #deadLinkRelations = "void-verified-notification-deadlink-relations";
	static cacheRelations(relations) {
		const relationsMap = this.#getRelations();
		for (const relation of relations) {
			relationsMap.set(relation.id, relation);
		}
		this.#setRelations(relationsMap);
	}

	static filterDeadLinks(activityIds) {
		const deadLinks =
			JSON.parse(sessionStorage.getItem(this.#deadLinkRelations)) ?? [];
		return activityIds.filter((id) => !deadLinks.includes(id));
	}

	static cacheDeadLinks(activityIds) {
		const deadLinks = new Set(
			JSON.parse(sessionStorage.getItem(this.#deadLinkRelations)),
		);
		for (const id of activityIds) {
			deadLinks.add(id);
		}
		sessionStorage.setItem(
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
				sessionStorage.getItem(
					this.#notificationRelationsInSessionStorage,
				),
			),
		);
		return relations;
	}

	static #setRelations(relations) {
		sessionStorage.setItem(
			this.#notificationRelationsInSessionStorage,
			JSON.stringify(Array.from(relations)),
		);
	}
}
