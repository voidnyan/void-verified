import {BasicCache} from "../utils/basicCache";
import {LocalStorageCacheKeys} from "../assets/localStorageKeys";
import {CacheTimes} from "../assets/cacheTimes";
import {ILighthouseSighting, ToudaiAPI} from "../api/toudaiAPI";
import {Toaster} from "../utils/toaster";
import {StaticSettings} from "../utils/staticSettings";
import {ToudaiCard} from "../components/ToudaiCard";

export class ToudaiHandler {
	private static url = "https://www.toudai.moe";
	private static cache = new BasicCache<ILighthouseSighting>(LocalStorageCacheKeys.lighthouses, CacheTimes.lighthouseCache);
	static addLighthouseTab() {

	}
	static handleLighthouseTab() {

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
}
