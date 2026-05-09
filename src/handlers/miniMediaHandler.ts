import {DOM} from "../utils/DOM";
import {MiniPopupHandlerBase} from "./miniPopupHandlerBase";
import {StaticSettings} from "../utils/staticSettings";
import {Loader} from "../components/loader";
import {IMediaOverview, MediaType} from "../api/queries/mediaOverviewQuery";
import {Toaster} from "../utils/toaster";
import {AnilistAPI} from "../api/anilistAPI";
import {MediaOverviewComponent} from "../components/mediaOverviewComponent";
import {BasicCache} from "../utils/basicCache";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {Common} from "../utils/common";
import {Checkbox, Label} from "../components/components";
import {CacheTimes} from "../assets/cacheTimes";

export class MiniMediaHandler extends MiniPopupHandlerBase {
	static cache: BasicCache<IMediaOverview> = new BasicCache(LocalStorageKeys.mediaOverviewCache, CacheTimes.miniMediaTimer);
	static config: MiniMediaConfig;

	static initialize(){
		this.config = new MiniMediaConfig();
		this.container = DOM.createDiv("mini-profile-container mini-profile-hidden mini-media-container");
		this.container.addEventListener("mouseover", () => {
			this.isVisible = true;
			this.showContainer();
		});
		this.container.addEventListener("mouseleave", () => {
			this.hideContainer();
		});
		document.body.append(this.container);
	}

	static addMediaHoverListeners(){
		if (!StaticSettings.options.miniMediaEnabled.getValue()){
			return;
		}

		let elements = [];
		if (this.config.hoverActivityTitles) {
			elements = [...document.querySelectorAll('.activity-entry a.title:not([void-mini="true"])')];
		}
		if (this.config.hoverEmbeds){
			elements = [...elements, ...document.querySelectorAll('a.media-embed:not([void-mini="true"])')];
		}
		if (this.config.hoverRelations) {
			elements = [...elements, ...document.querySelectorAll('.relations .media-preview-card a.cover:not([void-mini="true"])')];
			elements = [...elements, ...document.querySelectorAll('.relations .media-preview-card a.title:not([void-mini="true"])')];
		}

		for (const element of elements){
			element.addEventListener("mouseover", () => {
				this.isVisible = true;
				setTimeout(() => {
					if (!this.isVisible) {
						return;
					}
					this.hoverMedia(element);
				}, 100);
			});
			element.addEventListener("mouseleave", () => {
				this.hideContainer();
			});
			element.addEventListener("click", () => {
				this.hideContainer();
			})
			element.setAttribute("void-mini", "true");
		}
	}

	private static async hoverMedia(element: Element){
		this.container.replaceChildren(Loader());
		if (this.queryInProgress) {
			return;
		}
		this.positionContainer(element);

		const [type, id] = Common.getTypeAndIdFromUrl(element.getAttribute("href"));
		if (!type || !id) {
			return;
		}

		let media: IMediaOverview;
		try {
			media = await this.getMediaOverview(id, type);
		} catch (error){
			Toaster.error("Failed to query media overview data.", error);
			this.container.replaceChildren();
			return;
		}
		finally {
			this.queryInProgress = false;
		}
		this.container.replaceChildren(new MediaOverviewComponent(media, this.config).element);
	}

	private static async getMediaOverview(id: number, type: MediaType): Promise<IMediaOverview> {
		let media: IMediaOverview = null;
		const cachedItem = this.cache.getItem(x => x.id === id && x.type === type);
		if (cachedItem) {
			media = cachedItem;
		} else {
			Toaster.debug("Querying media overview data.");
			this.queryInProgress = true;
			const data = await AnilistAPI.getMediaOverview(id, type);
			if (data == null) {
				return;
			}
			media = data;
			this.cache.setItem(media);
		}
		return media;
	}

	private static positionContainer(anchor: Element){
		const anchorRect = anchor.getBoundingClientRect();

		const leftPosition = Math.min(anchorRect.left + window.scrollX - 30, window.innerWidth - 900);
		this.container.style.left = `${leftPosition}px`;

		this.container.style.top = `${anchorRect.bottom + window.scrollY + 10}px`;
		this.showContainer();
	}

	static renderSettings() {
		const container = DOM.createDiv();
		this.renderSettingsContainer(container)
		return container;
	}

	private static renderSettingsContainer(container: HTMLDivElement) {
		container.replaceChildren();
		container.append(DOM.create("h3", null, "Mini Media Overview Configuration"));

		const hoverEmbeds = Checkbox(this.config.hoverEmbeds, (event) => {
			this.config.hoverEmbeds = event.target.checked;
			this.config.save();
		});
		const hoverRelations = Checkbox(this.config.hoverRelations, (event) => {
			this.config.hoverRelations = event.target.checked;
			this.config.save();
		});
		const hoverActivityTitles = Checkbox(this.config.hoverActivityTitles, (event) => {
			this.config.hoverActivityTitles = event.target.checked;
			this.config.save();
		});
		const displayRelations = Checkbox(this.config.hideRelations, (event) => {
			this.config.hideRelations = event.target.checked;
			this.config.save();
		});
		const displayCharacters = Checkbox(this.config.hideCharacters, (event) => {
			this.config.hideCharacters = event.target.checked;
			this.config.save();
		});
		const displayStaff = Checkbox(this.config.hideStaff, (event) => {
			this.config.hideStaff = event.target.checked;
			this.config.save();
		});
		const hideBanner = Checkbox(this.config.hideBanner, (event) => {
			this.config.hideBanner = event.target.checked;
			this.config.save();
		});
		const hideCover = Checkbox(this.config.hideCover, (event) => {
			this.config.hideCover = event.target.checked;
			this.config.save();
		});
		const hideTags = Checkbox(this.config.hideTags, (event) => {
			this.config.hideTags = event.target.checked;
			this.config.save();
		});

		container.append(Label("Show when hovering media titles in activities", hoverActivityTitles));
		container.append(Label("Show when hovering embeds", hoverEmbeds));
		container.append(Label("Show when hovering relations in media page", hoverRelations));
		container.append(Label("Display Relations", displayRelations));
		container.append(Label("Display Characters", displayCharacters));
		container.append(Label("Display Staff", displayStaff));
		container.append(Label("Hide Banner", hideBanner));
		container.append(Label("Hide Cover", hideCover));
		container.append(Label("Hide Tags", hideTags));
	}
}

export class MiniMediaConfig {
	hoverEmbeds: boolean;
	hoverRelations: boolean;
	hoverActivityTitles: boolean;

	hideRelations: boolean;
	hideCharacters: boolean;
	hideStaff: boolean;

	hideBanner: boolean;
	hideCover: boolean;
	hideTags: boolean;

	private localStorage = LocalStorageKeys.miniMediaConfig;

	constructor() {
		const config = JSON.parse(localStorage.getItem(this.localStorage));
		this.hoverEmbeds = config?.hoverEmbeds ?? false;
		this.hoverRelations = config?.hoverRelations ?? false;
		this.hoverActivityTitles = config?.hoverActivityTitles ?? true;
		this.hideRelations = config?.hideRelations ?? false;
		this.hideCharacters = config?.hideCharacters ?? false;
		this.hideStaff = config?.hideStaff ?? false;
		this.hideBanner = config?.hideBanner ?? false;
		this.hideCover = config?.hideCover ?? false;
		this.hideTags = config?.hideTags ?? false;
	}

	save() {
		localStorage.setItem(this.localStorage, JSON.stringify(this));
	}
}
