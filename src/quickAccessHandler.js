import { AnilistAPI } from "./api/anilistAPI";
import { DOM } from "./helpers/DOM";
import { Toaster } from "./utils/toaster";

export class QuickAccess {
	settings;
	#quickAccessId = "void-quick-access";
	#lastFetchedLocalStorage = "void-verified-last-fetched";
	#lastFetched;
	#queryInProgress = false;

	#apiQueryTimeoutInMinutes = 15;
	#apiQueryTimeout = this.#apiQueryTimeoutInMinutes * 60 * 1000;
	constructor(settings) {
		this.settings = settings;
		const fetched = localStorage.getItem(this.#lastFetchedLocalStorage);
		if (fetched) {
			this.#lastFetched = new Date(fetched);
		}
	}

	async renderQuickAccess() {
		if (this.#queryInProgress) {
			return;
		}

		const queried = await this.#queryUsers();

		if (!queried && this.#quickAccessRendered()) {
			this.#updateTimer();
			return;
		}

		if (
			!this.settings.options.quickAccessEnabled.getValue() &&
			!this.settings.verifiedUsers.some((user) => user.quickAccessEnabled)
		) {
			return;
		}

		const quickAccessContainer = DOM.getOrCreate(
			"div",
			"#quick-access quick-access"
		);

		const sectionHeader = document.createElement("div");
		sectionHeader.setAttribute("class", "section-header");
		const title = document.createElement("h2");
		title.append("Quick Access");
		title.setAttribute(
			"title",
			`Last updated at ${this.#lastFetched.toLocaleTimeString()}`
		);
		sectionHeader.append(title);

		const timer = DOM.create("span", "quick-access-timer", "");
		sectionHeader.append(timer);

		const quickAccessBody = document.createElement("div");
		quickAccessBody.setAttribute("class", "void-quick-access-wrap");

		for (const user of this.#getQuickAccessUsers()) {
			quickAccessBody.append(this.#createQuickAccessLink(user));
		}

		const section = document.querySelector(
			".container > .home > div:nth-child(2)"
		);

		quickAccessContainer.replaceChildren(sectionHeader, quickAccessBody);

		if (DOM.get("#void-quick-access")) {
			return;
		}
		section.insertBefore(quickAccessContainer, section.firstChild);
	}

	#updateTimer() {
		const timer = DOM.get(".void-quick-access-timer");
		const nextQuery = new Date(
			this.#lastFetched.getTime() + this.#apiQueryTimeout
		);
		const timeLeftInSeconds = Math.floor((nextQuery - new Date()) / 1000);
		const timeLeftInMinutes = timeLeftInSeconds / 60;

		if (timeLeftInMinutes > 1) {
			timer.replaceChildren(`${Math.floor(timeLeftInSeconds / 60)}m`);
			return;
		}

		timer.replaceChildren(`${timeLeftInSeconds}s`);
	}

	async #queryUsers() {
		const currentTime = new Date();

		if (
			!this.#lastFetched ||
			currentTime - this.#lastFetched > this.#apiQueryTimeout
		) {
			try {
				Toaster.debug("Querying Quick Access users.");
				this.#queryInProgress = true;
				const anilistAPI = new AnilistAPI(this.settings);
				await anilistAPI.queryVerifiedUsers();
				this.#lastFetched = new Date();
				localStorage.setItem(
					this.#lastFetchedLocalStorage,
					this.#lastFetched
				);
				Toaster.success("Quick Access users updated.");
			} catch (error) {
				Toaster.error("Querying Quick Access failed.");
				console.error(error);
			} finally {
				this.#queryInProgress = false;
				return true;
			}
		} else {
			return false;
		}
	}

	clearBadge() {
		const username =
			window.location.pathname.match(/^\/user\/([^/]*)\/?/)[1];
		this.settings.updateUserOption(
			username,
			"quickAccessBadgeDisplay",
			false
		);
	}

	#createQuickAccessLink(user) {
		const container = document.createElement("a");
		container.setAttribute("class", "void-quick-access-item");
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

		if (
			(this.settings.options.quickAccessBadge.getValue() ||
				user.quickAccessBadge) &&
			user.quickAccessBadgeDisplay
		) {
			container.classList.add("void-quick-access-badge");
		}

		container.append(username);
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
