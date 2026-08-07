import {BasicCache} from "../utils/basicCache";
import {LocalStorageCacheKeys} from "../assets/localStorageKeys";
import {CacheTimes} from "../assets/cacheTimes";
import {ILighthouseSighting, ToudaiAPI} from "../api/toudaiAPI";
import {Toaster} from "../utils/toaster";
import {StaticSettings} from "../utils/staticSettings";
import {ToudaiCard} from "../components/ToudaiCard";
import {DOM} from "../utils/DOM";
import {Common} from "../utils/common";

interface ILighthouseTab {
	mediaId: number,
	sightings: ILighthouseSighting[];
}

export class ToudaiHandler {
	private static url = "https://www.toudai.moe";
	private static cache = new BasicCache<ILighthouseSighting>(LocalStorageCacheKeys.lighthouses, CacheTimes.lighthouseCache);
	private static tabCache = new BasicCache<ILighthouseTab>(LocalStorageCacheKeys.lighthousesTab, CacheTimes.day);

	private static lighthouseTab: HTMLDivElement;

	static addLighthouseTab() {
		if (!StaticSettings.options.lighthouseTabEnabled.getValue())
			return;

		const path = window.location.pathname;

		if (!path.startsWith("/anime/") && !path.startsWith("/manga/")) {
			return;
		}

		const mediaNav = document.querySelector(".media .content .nav:not([void-lighthouse-tab='true'])");
		if (!mediaNav)
			return;

		mediaNav.setAttribute("void-lighthouse-tab", "true");

		for (const link of mediaNav.children) {
			link.addEventListener("click", () => {
				mediaNav.removeAttribute("void-lighthouse-tab-selected");
				this.lighthouseTab?.remove();
			})
		}

		const lighthouseNavButton = DOM.create("span", "media-nav-item", "Lighthouses");
		lighthouseNavButton.addEventListener("click", () => {
			mediaNav.setAttribute("void-lighthouse-tab-selected", "true");
			this.handleLighthouseTab();
		});
		mediaNav.append(lighthouseNavButton);
	}

	private static async handleLighthouseTab(){
		const container = DOM.createDiv("lighthouse-tab");
		const [_, id] = Common.getTypeAndIdFromUrl(window.location.pathname);
		if (!id)
			return;

		let sightings: ILighthouseSighting[] = [];
		try {
			sightings = await this.getSigthingsForMedia(id);
		} catch (e) {
			Toaster.error("Failed to query lighthouse sightings.", e);
		}

		if (sightings.length > 0) {
			for (const lighthouse of sightings) {
				container.append(new ToudaiCard(lighthouse).element);
			}
		} else {
			container.append(DOM.createDiv(
				"lighthouse-tab-no-sightings",
				"No lighthouse sightings found for this entry :("));
		}

		this.lighthouseTab = container;
		document.querySelector(".media .content.container")?.append(container);
	}

	static replaceLinksWithLighthouseCard() {
		if (!StaticSettings.options.lighthouseCardEnabled.getValue()) {
			return;
		}

		const toudaiAnchors = document.querySelectorAll<HTMLAnchorElement>(
			`.markdown a[href^="${this.url}/sighting?id"]:not([void-query-in-progress="true"]):not(.void-toudai-card-direct-link)`);
		for (const anchor of toudaiAnchors) {
			this.replaceLinkWithLighthouseCard(anchor);
		}
	}

	private static async replaceLinkWithLighthouseCard(anchor: HTMLAnchorElement) {
		anchor.setAttribute("void-query-in-progress", "true");
		const sightingId = +anchor.href.match(/[?&]id=(\d+)/)?.[1];
		const lighthouse = await this.getSighting(sightingId);
		anchor.replaceWith(new ToudaiCard(lighthouse).element);
	};

	private static async getSighting(id: number) {
		try {
			const cachedSigthing = await this.cache.getItem(x => x.id === id);
			if (cachedSigthing)
				return cachedSigthing;

			Toaster.debug(`Querying lighthouse sighting ${id}.`);
			const lighthouse = await ToudaiAPI.getLighthouseBySightingId(id);
			await this.cache.setItem(lighthouse);
			return lighthouse;
		} catch (e) {
			Toaster.error("Failed to query lighthouse.", e);
		}
	}

	private static async getSigthingsForMedia(mediaId: number) {
		try {
			const cachedSigthing = await this.tabCache.getItem(x => x.mediaId === mediaId);
			if (cachedSigthing)
				return cachedSigthing.sightings;

			Toaster.debug(`Querying lighthouse sightings for media ${mediaId}.`);
			const lighthouses = await ToudaiAPI.getLighthouseSightingsByMediaId(mediaId);
			await this.tabCache.setItem({
				mediaId,
				sightings: lighthouses
			});
			return lighthouses;
		} catch (e) {
			Toaster.error("Failed to query lighthouses.", e);
		}
	}
}
