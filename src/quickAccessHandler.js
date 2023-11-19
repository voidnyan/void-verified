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
		quickAccessContainer.setAttribute("id", this.#quickAccessId);

		const sectionHeader = document.createElement("div");
		sectionHeader.setAttribute("class", "section-header");
		const title = document.createElement("h2");
		title.append("Quick Access");
		sectionHeader.append(title);

		quickAccessContainer.append(sectionHeader);

		const quickAccessBody = document.createElement("div");
		quickAccessBody.style = `
            background: rgb(var(--color-foreground));
            display: grid;
            grid-template-columns: repeat(auto-fill, 60px);
            grid-template-rows: repeat(auto-fill, 80px);
            gap: 15px;
            padding: 20px;
            margin-bottom: 25px;
        `;

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
		container.style.display = "inline-block";
		const link = document.createElement("a");
		container.setAttribute(
			"href",
			`https://anilist.co/user/${user.username}/`
		);

		const image = document.createElement("div");
		image.style = `
            background-image: url(${user.avatar});
            display: flex;
            background-size: contain;
            background-repeat: no-repeat;
            height: 60px;
            width: 60px;
        `;

		container.append(image);

		const username = document.createElement("div");
		username.append(user.username);

		username.style = `
            display: inline-block;
            text-align: center;
            bottom: -20px;
            width: 100%;
            word-break: break-all;
            font-size: 1.2rem;
        `;

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
