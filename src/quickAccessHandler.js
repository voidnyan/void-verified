export class QuickAccess {
	settings;
	#quickAccessId = "void-verified-quick-access";
	constructor(settings) {
		this.settings = settings;
	}

	renderQuickAccess() {
		if (this.#quickAccessRendered()) {
			return;
		}

		if (
			!this.settings.options.quickAccessEnabled.getValue() &&
			!this.settings.verifiedUsers.some((user) => user.quickAccessEnabled)
		) {
			return;
		}

		const quickAccessContainer = document.createElement("div");
		quickAccessContainer.setAttribute("class", "void-quick-access");
		quickAccessContainer.setAttribute("id", this.#quickAccessId);

		const sectionHeader = document.createElement("div");
		sectionHeader.setAttribute("class", "section-header");
		const title = document.createElement("h2");
		title.append("Quick Access");
		sectionHeader.append(title);

		quickAccessContainer.append(sectionHeader);

		const quickAccessBody = document.createElement("div");
		quickAccessBody.setAttribute("class", "void-quick-access-wrap");

		for (const user of this.#getQuickAccessUsers()) {
			quickAccessBody.append(this.#createQuickAccessLink(user));
		}

		quickAccessContainer.append(quickAccessBody);

		const section = document.querySelector(
			".container > .home > div:nth-child(2)"
		);
		section.insertBefore(quickAccessContainer, section.firstChild);
	}

	#createQuickAccessLink(user) {
		const container = document.createElement("a");
		container.setAttribute("class", "void-quick-access-item");
		const link = document.createElement("a");
		container.setAttribute(
			"href",
			`https://anilist.co/user/${user.username}/`
		);

		const image = document.createElement("div");
		image.style.backgroundImage = `url(${user.avatar})`;
		image.setAttribute("class", "void-quick-access-pfp");
		container.append(image);

		const username = document.createElement("div");
		username.append(user.username);
		username.setAttribute("class", "void-quick-access-username");

		container.append(username);
		container.append(link);
		return container;
	}

	#quickAccessRendered() {
		const quickAccess = document.getElementById(this.#quickAccessId);
		return quickAccess !== null;
	}

	#getQuickAccessUsers() {
		if (this.settings.options.quickAccessEnabled.getValue()) {
			return this.settings.verifiedUsers;
		}

		return this.settings.verifiedUsers.filter(
			(user) => user.quickAccessEnabled
		);
	}
}
