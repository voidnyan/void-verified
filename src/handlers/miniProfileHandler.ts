import {DOM} from "../utils/DOM";
import {Checkbox, Label, Option, RangeField, Select, Tooltip} from "../components/components";
import {AnilistAPI} from "../api/anilistAPI";
import {StaticSettings} from "../utils/staticSettings";
import {ColorFunctions} from "../utils/colorFunctions";
import {Toaster} from "../utils/toaster";
import {Markdown} from "../utils/markdown";
import {LocalStorageKeys} from "../assets/localStorageKeys";

export class MiniProfileHandler {
	protected static miniProfileContainer: HTMLElement;
	private static queryInProgress = false;
	private static isVisible = false;
	static config: MiniProfileConfig;

	static initialize() {
		this.miniProfileContainer = DOM.create("div", "mini-profile-container mini-profile-hidden");
		this.miniProfileContainer.addEventListener("mouseover", () => {
			this.isVisible = true;
			this.showMiniProfile();
		});
		this.miniProfileContainer.addEventListener("mouseleave", () => {
			this.hideMiniProfile();
		});
		document.body.append(this.miniProfileContainer);
		this.config = new MiniProfileConfig();
	}
	static addUserHoverListeners() {
		if (!StaticSettings.options.miniProfileEnabled.getValue()) {
			return;
		}
		let elements = [...document.querySelectorAll('.activity-entry a.name:not([void-mini="true"])')];

		if (this.config.hoverTags) {
			elements = [...elements, ...document.querySelectorAll('.markdown a[href^="/user/"]:not([void-mini="true"])')];
		}

		for (const element of elements) {
			element.addEventListener("mouseover", () => {
				this.isVisible = true;
				setTimeout(() => {
					if (!this.isVisible) {
						return;
					}
					this.#hoverUser(element);
				}, 100);
			});
			element.addEventListener("mouseleave", () => {
				this.hideMiniProfile();
			});
			element.addEventListener("click", () => {
				this.hideMiniProfile();
			})
			element.setAttribute("void-mini", "true");
		}
	}

	static async #hoverUser(element: Element) {
		this.miniProfileContainer.replaceChildren();
		if (this.queryInProgress) {
			return;
		}

		let user = null;
		const username = element.innerHTML.trim().replace("@", "");
		try {
			const cachedUser = MiniProfileCache.getUser(username);
			if (cachedUser) {
				user= cachedUser;
			} else {
				Toaster.debug("Querying mini profile data.");
				this.queryInProgress = true;
				const data = await AnilistAPI.getMiniProfile(username, this.config.numberOfFavourites);
				if (data === null) {
					return;
				}
				user = this.addMissingTypes(data);
				MiniProfileCache.addUser(user);
			}
		} catch (error) {
			Toaster.error(`Failed to query mini profile data for ${username}`, error)
			return;
		} finally {
			this.queryInProgress = false;
		}

		this.miniProfileContainer.style.backgroundImage = `url(${user.bannerImage})`;
		this.miniProfileContainer.style.setProperty("--color-blue", ColorFunctions.handleAnilistColor(user.options.profileColor));

		this.createHeader(user);
		this.createContent(user);

		const elementRect = element.getBoundingClientRect();
		const containerRect = this.miniProfileContainer.getBoundingClientRect();
		this.miniProfileContainer.style.left = `${elementRect.left + window.scrollX + elementRect.width}px`;
		this.miniProfileContainer.style.maxWidth = `${window.innerWidth - elementRect.right - 30}px`;
		if (this.config.position === "top") {
			this.miniProfileContainer.style.top = `${elementRect.top + window.scrollY + elementRect.height - containerRect.height}px`;
		} else if (this.config.position === "center") {
			this.miniProfileContainer.style.top = `${elementRect.top + window.scrollY + (elementRect.height / 2) - (containerRect.height / 2)}px`;
		} else {
			this.miniProfileContainer.style.top = `${elementRect.top + window.scrollY}px`;
		}
		this.showMiniProfile();
	}

	private static addMissingTypes(data) {
		data?.favourites?.characters?.nodes.forEach(character => {
			character["type"] = "character";
		});

		data?.favourites?.staff?.nodes.forEach(staff => {
			staff["type"] = "staff";
		});
		return data;
	}

	private static createHeader(user) {
		const header = DOM.create("div", "mini-profile-header");
		const avatar = DOM.create("a", "mini-profile-avatar");
		avatar.style.backgroundImage = `url(${user.avatar.large})`;
		header.append(avatar);
		const name = DOM.create("div", "mini-profile-username", user.name);
		header.append(name)

		this.handleFollowBadge(user, header);


		if (user.donatorTier > 0) {
			const donatorBadge = DOM.create("div", "mini-profile-donator-badge", user.donatorTier > 3 ? user.donatorBadge : "Donator");
			if (user.donatorTier > 4) {
				donatorBadge.classList.add("void-mini-profile-donator-rainbow-badge");
			}
			header.append(donatorBadge);
		}
		this.miniProfileContainer.append(header);
	}

	private static handleFollowBadge(user, header: HTMLElement) {
		if (!user.isFollower && !user.isFollowing) {
			return;
		}
		let text = "";
		if (user.isFollower && user.isFollowing) {
			text = "Mutuals";
		} else if (user.isFollower) {
			text = "Follows you"
		} else {
			text = "Followed"
		}
		const followsYou = DOM.create("div", " mini-profile-donator-badge mini-profile-follow-badge", text);
		followsYou.style.backgroundColor = `rgba(${ColorFunctions.handleAnilistColor(user.options.profileColor)}, .8)`;
		header.append(followsYou);
	}

	private static createContent(user) {
		const content = DOM.create("div", "mini-profile-content-container");

		if (this.config.displayAnime && user.favourites.anime.nodes.length > 0) {
			content.append(this.addFavourites(user.favourites.anime.nodes));
		}
		if (this.config.displayManga && user.favourites.manga.nodes.length > 0) {
			content.append(this.addFavourites(user.favourites.manga.nodes));
		}
		if (this.config.displayCharacters && user.favourites.characters.nodes.length > 0) {
			content.append(this.addFavourites(user.favourites.characters.nodes));
		}
		if (this.config.displayStaff && user.favourites.staff.nodes.length > 0) {
			content.append(this.addFavourites(user.favourites.staff.nodes));
		}

		if (this.config.displayBio && user.about?.length > 0) {
			content.prepend(this.addBio(user));
		}

		this.miniProfileContainer.append(content);
	}

	private static addFavourites(favourites: any[]) {
		const favouritesContainer = DOM.create("div", "mini-profile-section");
		for (const favourite of favourites) {
			const cover = DOM.create<HTMLAnchorElement>("a","mini-profile-favourite");
			cover.href = `/${favourite.type.toLowerCase()}/${favourite.id}`
			cover.style.backgroundImage = `url(${favourite.coverImage?.large ?? favourite.image?.large})`;
			if (favourite.isFavourite) {
				cover.classList.add("void-mini-profile-favourited");
			}
			favouritesContainer.append(Tooltip(favourite.title?.userPreferred ?? favourite.name?.userPreferred, cover));
		}
		return favouritesContainer;
	}

	private static addBio(user) {
		const rect = this.miniProfileContainer.getBoundingClientRect();
		const bioMaxWidth = Math.max(rect.width, 500);
		const markdown = DOM.createDiv(".markdown");
		markdown.innerHTML = Markdown.parse(user.about);
		Markdown.applyFunctions(markdown);
		const container = DOM.create("div", "mini-profile-section mini-profile-about", markdown);
		container.setAttribute("style", `max-width: ${bioMaxWidth}px`);
		return container;
	}

	private static showMiniProfile() {
		if (!this.isVisible) {
			return;
		}
		this.miniProfileContainer.classList.remove("void-mini-profile-hidden");
	}

	private static hideMiniProfile() {
		this.isVisible = false;
		setTimeout(() => {
			if (!this.isVisible) {
				this.miniProfileContainer.classList.add("void-mini-profile-hidden");
			}
		}, 300);
	}

	static renderSettings() {
		const container = DOM.createDiv();
		this.renderSettingsContainer(container, new MiniProfileConfig());
		return container;
	}

	private static renderSettingsContainer(container: HTMLElement, config: MiniProfileConfig) {
		container.replaceChildren();
		container.append(DOM.create("h3", null, "Mini Profile Configuration"));

		const positionOptions = ["top", "center", "bottom"].map(position =>
			Option(position,
				config.position === position,
				() => {
					config.position = position as "top" | "center" | "bottom";
					config.save();
					this.renderSettingsContainer(container, config);
				}));

		const positionSelect = Select(positionOptions);
		container.append(Label("Position", positionSelect));

		const numberOfFavourites = RangeField(
			config.numberOfFavourites,
			(event) => {
				config.numberOfFavourites = +event.target.value;
				config.save();
				MiniProfileCache.clearCache();
			},
			25,
			1,
			1);

		container.append(Label("Number of favourites", numberOfFavourites));

		const hoverTagsCheckbox = Checkbox(config.hoverTags, (event) => {
			config.hoverTags = event.target.checked;
			config.save();
		});

		container.append(Label("Show when hovering @", hoverTagsCheckbox));

		const bioCheckBox = Checkbox(config.displayBio, (event) => {
			config.displayBio = event.target.checked;
			config.save();
		});

		const animeCheckbox = Checkbox(config.displayAnime, (event) => {
			config.displayAnime = event.target.checked;
			config.save();
		})

		const mangaCheckBox = Checkbox(config.displayManga, (event) => {
			config.displayManga = event.target.checked;
			config.save();
		})

		const charactersCheckBox = Checkbox(config.displayCharacters, (event) => {
			config.displayCharacters = event.target.checked;
			config.save();
		})

		const staffCheckbox = Checkbox(config.displayStaff, (event) => {
			config.displayStaff = event.target.checked;
			config.save();
		})

		container.append(Label("Display bio", bioCheckBox));
		container.append(Label("Display anime favourites", animeCheckbox));
		container.append(Label("Display manga favourites ", mangaCheckBox));
		container.append(Label("Display character favourites ", charactersCheckBox));
		container.append(Label("Display staff favourites", staffCheckbox));

	}
}

class MiniProfileCache {
	static #localStorage = LocalStorageKeys.miniProfileCache;

	static getUser(username: string) {
		const cache = this.#getCache();
		const user = cache.find(x => x.name === username);

		if (!user) {
			return;
		}

		const cachedAt = new Date(user.cachedAt);
		cachedAt.setHours(cachedAt.getHours() + 12)

		if (cachedAt < new Date()) {
			this.#removeUser(user)
			return null;
		}

		return user;
	}

	static addUser(user) {
		const cache = this.#getCache();
		if (!this.getUser(user)) {
			user.cachedAt = new Date();
			cache.push(user);
			this.#saveCache(cache);
		}
	}

	static #removeUser(user) {
		const cache = this.#getCache().filter(x => x.name !== user.name);
		this.#saveCache(cache);
	}

	static #getCache() {
		return JSON.parse(localStorage.getItem(this.#localStorage)) ?? [];
	}

	static #saveCache(cache) {
		localStorage.setItem(this.#localStorage, JSON.stringify(cache));
	}

	static clearCache() {
		localStorage.removeItem(this.#localStorage);
	}
}

class MiniProfileConfig {
	numberOfFavourites: number;
	position: "top" | "center" | "bottom";
	hoverTags: boolean;
	displayAnime: boolean;
	displayManga: boolean;
	displayCharacters: boolean;
	displayStaff: boolean;
	displayBio: boolean;

	#localStorage = LocalStorageKeys.miniProfileConfig;

	constructor() {
		const config = JSON.parse(localStorage.getItem(this.#localStorage));
		this.numberOfFavourites = config?.numberOfFavourites ?? 6;
		this.position = config?.position ?? "bottom";
		this.hoverTags = config?.hoverTags ?? true;
		this.displayBio = config?.displayBio ?? true;
		this.displayAnime = config?.displayAnime ?? true;
		this.displayManga = config?.displayManga ?? true;
		this.displayCharacters = config?.displayCharacters ?? false;
		this.displayStaff = config?.displayStaff ?? false;
	}

	save() {
		localStorage.setItem(this.#localStorage, JSON.stringify(this));
	}
}
