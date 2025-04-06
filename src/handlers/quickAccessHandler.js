import { AnilistAPI } from "../api/anilistAPI";
import { RefreshIcon } from "../assets/icons";
import { IconButton } from "../components/components";
import { DOM } from "../utils/DOM";
import { Toaster } from "../utils/toaster";
import {StaticSettings} from "../utils/staticSettings";
import {FuzzyMatch} from "../utils/fuzzyMatch";

export class QuickAccess {
	settings;
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
			"#quick-access quick-access",
		);

		const container = DOM.create("div", "quick-access-users-wrap");

		const sectionHeader = this.#renderHeader();
		const users = QuickAccess.renderUsers();

		container.append(sectionHeader, users);

		this.#insertIntoDOM(quickAccessContainer, container);
	}

	#renderHeader() {
		const sectionHeader = document.createElement("div");
		sectionHeader.setAttribute("class", "section-header");
		const title = document.createElement("h2");
		title.append("Users");
		title.setAttribute(
			"title",
			`Last updated at ${this.#lastFetched.toLocaleTimeString()}`,
		);
		sectionHeader.append(title);

		const timer = DOM.create("span", "quick-access-timer", "");

		const refreshButton = IconButton(RefreshIcon(), () => {
			this.#queryUsers(true);
		});

		sectionHeader.append(DOM.create("div", null, [timer, refreshButton]));

		return sectionHeader;
	}

	static renderUsers(usernameFilter) {
		const quickAccessBody = document.createElement("div");
		quickAccessBody.setAttribute("class", "void-quick-access-wrap");

		for (const user of this.#getQuickAccessUsers()) {
			if (usernameFilter?.length > 0 && !FuzzyMatch.match(usernameFilter, user.username)) {
				continue;
			}
			quickAccessBody.append(this.#createQuickAccessLink(user));
		}

		return quickAccessBody;
	}

	#updateTimer() {
		if (!this.settings.options.quickAccessTimer.getValue()) {
			return;
		}
		const timer = DOM.get("quick-access-timer");
		const nextQuery = new Date(
			this.#lastFetched.getTime() + this.#apiQueryTimeout,
		);
		const timeLeftInSeconds = Math.floor((nextQuery - new Date()) / 1000);
		const timeLeftInMinutes = timeLeftInSeconds / 60;

		if (timeLeftInMinutes > 1) {
			timer.replaceChildren(`${Math.floor(timeLeftInSeconds / 60)}m`);
			return;
		}

		timer.replaceChildren(`${timeLeftInSeconds}s`);
	}

	async #queryUsers(ignoreLastFetched = false) {
		const currentTime = new Date();

		if (
			!this.#lastFetched ||
			currentTime - this.#lastFetched > this.#apiQueryTimeout ||
			ignoreLastFetched
		) {
			try {
				Toaster.debug("Querying Quick Access users.");
				this.#queryInProgress = true;
				const anilistAPI = new AnilistAPI(this.settings);
				await anilistAPI.queryVerifiedUsers();
				Toaster.success("Quick Access users updated.");
			} catch (error) {
				Toaster.error("Querying Quick Access failed.", error);
			} finally {
				this.#lastFetched = new Date();
				localStorage.setItem(
					this.#lastFetchedLocalStorage,
					this.#lastFetched,
				);
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
			false,
		);
	}

	static #createQuickAccessLink(user) {
		const container = DOM.create("a", "quick-access-item");
		container.setAttribute(
			"href",
			`/user/${user.username}/`,
		);

		const image = document.createElement("div");
		image.style.backgroundImage = `url(${user.avatar})`;
		image.setAttribute("class", "void-quick-access-pfp");
		container.append(image);

		const username = document.createElement("div");
		username.append(user.username);
		username.setAttribute("class", "void-quick-access-username");

		if (
			(StaticSettings.options.quickAccessBadge.getValue() ||
				user.quickAccessBadge) &&
			user.quickAccessBadgeDisplay
		) {
			container.classList.add("void-quick-access-badge");
		}

		container.append(username);
		return container;
	}

	#quickAccessRendered() {
		const quickAccess = document.querySelector(".home .void-quick-access-wrap");
		return quickAccess !== null;
	}

	static #getQuickAccessUsers() {
		if (StaticSettings.options.quickAccessEnabled.getValue()) {
			return StaticSettings.settingsInstance.verifiedUsers;
		}

		return StaticSettings.settingsInstance.verifiedUsers.filter(
			(user) => user.quickAccessEnabled,
		);
	}

	#insertIntoDOM(quickAccessContainer, container) {
		if (
			quickAccessContainer.querySelector(".void-quick-access-users-wrap")
		) {
			const oldUsers = DOM.get("quick-access-users-wrap");
			quickAccessContainer.replaceChild(container, oldUsers);
		} else {
			quickAccessContainer.append(container);
		}

		if (DOM.get("#quick-access")) {
			return;
		}
		const section = document.querySelector(
			".container > .home > div:nth-child(2)",
		);
		section.insertBefore(quickAccessContainer, section.firstChild);
	}
}
