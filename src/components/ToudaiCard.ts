import {ILighthouseSighting} from "../api/toudaiAPI";
import {DOM} from "../utils/DOM";
import {CarouselLeftIcon, CarouselRightIcon, ImageIcon, LinkIcon} from "../assets/icons";
import {Markdown} from "../utils/markdown";
import {AnilistAuth} from "../utils/anilistAuth";

export class ToudaiCard {
	private readonly sighting: ILighthouseSighting;
	element: HTMLDivElement;

	constructor(sighting: ILighthouseSighting) {
		this.sighting = sighting;
		this.createCard();
	}

	private createCard() {
		this.element = DOM.createDiv("toudai-card");
		this.createCardHeader();
		this.createImageWrap();
		this.createTitle();
		this.createMetaRow();
		this.createLighthouseBlock();
		this.createNotes();
	}

	private createCardHeader() {
		const header = DOM.createDiv("toudai-card-header");
		const date = DOM.createDiv("toudai-card-date", this.sighting.date_spotted);
		const toudaiLink = DOM.createAnchor(
			`https://www.toudai.moe/sighting?id=${this.sighting.id}`,
			"toudai-card-direct-link",
			LinkIcon(), true);
		header.append(date, toudaiLink);
		this.element.append(header);
	}

	private createImageWrap() {
		if (!(this.sighting.image_link?.length > 0))
			return;

		const wrapper = DOM.createDiv("toudai-card-image-wrap");
		const image = DOM.create("img", "toudai-card-image");
		image.setAttribute("loading", "lazy");
		image.setAttribute("decoding", "async");
		image.setAttribute("src", this.sighting.image_link[0]);

		wrapper.append(image);
		this.element.append(wrapper);

		const imageCount = this.sighting.image_link.length;

		if (imageCount === 1)
			return;

		let imageIndex = 0;

		const leftButton = DOM.create("div", "toudai-card-image-nav-btn", CarouselLeftIcon());
		leftButton.addEventListener("click", () => {
			imageIndex = Math.max(imageIndex - 1, 0);
			image.setAttribute("src", this.sighting.image_link[imageIndex]);
		});

		const rightButton = DOM.create("div", "toudai-card-image-nav-btn", CarouselRightIcon());
		rightButton.addEventListener("click", () => {
			imageIndex = Math.min(imageIndex + 1, imageCount - 1);
			image.setAttribute("src", this.sighting.image_link[imageIndex]);
		});

		wrapper.append(leftButton, rightButton);
	}

	private createTitle() {
		const wrapper = DOM.createDiv("toudai-card-title");
		const titleText = DOM.create("span", "toudai-card-title-text", this.getTitle());
		wrapper.append(titleText);
		if (this.sighting.image_link.length > 1) {
			const multiImageIndicator = DOM.create("span", "toudai-card-multi-image-indicator", ImageIcon());
			wrapper.append(multiImageIndicator)
		}
		this.element.append(wrapper);
	}

	private getTitle(): string {
		let title: string;
		switch (AnilistAuth.titleLanguage) {
			case "ROMAJI":
				title = this.sighting.title_r;
				break;
			case "ENGLISH":
				title = this.sighting.title_en;
				break;
			case "NATIVE":
				title = this.sighting.title_jp;
				break;
		}

		if (!title) {
			title = this.sighting.title_r ?? this.sighting.title_en ?? this.sighting.title_jp;
		}
		return title;
	}

	private createMetaRow() {
		if (!this.sighting.episode && !this.sighting.anilist_link)
			return;

		const wrapper = DOM.createDiv("toudai-card-meta-row");
		if (this.sighting.episode) {
			const episode = DOM.create("span", null, this.sighting.episode);
			if (this.sighting.timestamp) {
				episode.append(" / " + this.sighting.timestamp);
			}
			wrapper.append(episode);
		}
		if (this.sighting.anilist_link) {
			if (this.sighting.episode) {
				const dotStep =DOM.create("span", "toudai-card-dot-step", " • ");
				wrapper.append(dotStep);
			}
			const anilistLink = DOM.createAnchor(this.sighting.anilist_link, null,
				[this.createIcon("https://www.toudai.moe/images/favicon-al.png"), "AniList"]);
			anilistLink.setAttribute("target", "_blank");
			wrapper.append(anilistLink);
		}
		this.element.append(wrapper)
	}

	private createLighthouseBlock() {
		if (!this.sighting.lighthouses)
			return;
		const lighthouse = this.sighting.lighthouses;

		const wrapper = DOM.createDiv("toudai-card-lighthouse-block");
		if (lighthouse.name_en) {
			let name = lighthouse.name_en;
			if (lighthouse.name_jp)
				name += ` (${lighthouse.name_jp})`;
			const lighthouseName = DOM.create("span", "toudai-card-lighthouse-name", name);
			const nameDiv = DOM.createDiv(null, lighthouseName);
			wrapper.append(nameDiv);
		}

		const locationBlock = DOM.createDiv();
		if (lighthouse.prefecture) {
			locationBlock.append(DOM.create("span", null, `📌 ${lighthouse.prefecture}`));
		}
		if (lighthouse.google_maps_link) {
			const gMapsLink = DOM.createAnchor(lighthouse.google_maps_link, null,
				[this.createIcon("https://www.toudai.moe/images/favicon-map.png"), "Maps"], true);
			locationBlock.append(DOM.create("span", null, gMapsLink));
		}
		wrapper.append(locationBlock);

		const informationBlock = DOM.createDiv();
		if (lighthouse.wiki_en) {
			const anchor = DOM.createAnchor(lighthouse.wiki_en, null,
				[this.createIcon("https://www.toudai.moe/images/favicon-wiki.png"), "Wikipedia (EN)"], true);
			informationBlock.append(anchor);
		}
		if (lighthouse.wiki_jp) {
			const anchor = DOM.createAnchor(lighthouse.wiki_jp, null,
				[this.createIcon("https://www.toudai.moe/images/favicon-wiki.png"), "Wikipedia (JP)"], true);
			informationBlock.append(anchor);
		}
		if (lighthouse.lighthouse_japan_link) {
			const anchor = DOM.createAnchor(lighthouse.lighthouse_japan_link, null,
				[this.createIcon("https://www.toudai.moe/images/favicon-lj.png"), "Lighthouse-JAPAN.com"],true);
			informationBlock.append(anchor);
		}
		wrapper.append(informationBlock);
		this.element.append(wrapper);
	}

	private createNotes() {
		if (!this.sighting.notes)
			return;

		const wrapper = DOM.createDiv("toudai-card-notes");
		const label = DOM.create("span", "toudai-card-notes-label", "Notes: ");
		const noteMarkdown = Markdown.parseLinks(this.sighting.notes);
		const note = DOM.create("span", null);
		note.innerHTML = noteMarkdown
		wrapper.append(label, note);
		this.element.append(wrapper);
	}

	private createIcon(imgSrc: string): HTMLImageElement {
		const icon = DOM.create<HTMLImageElement>("img", "toudai-card-link-icon");
		icon.setAttribute("src", imgSrc);
		return icon;
	}
}
