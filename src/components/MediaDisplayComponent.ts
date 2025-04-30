import {IMediaSearchResult} from "./MediaSearchComponent";
import {DOM} from "../utils/DOM";

export class MediaDisplayComponent {
	element: HTMLDivElement;
	constructor(media: IMediaSearchResult) {
		this.element = DOM.createDiv("media-display-container");
		const poster = DOM.createDiv("media-display-poster");
		poster.setAttribute("style", `background-image: url(${media.coverImage.large})`);

		const info = DOM.create("div","media-display-info");
		const title = DOM.create("div", "media-display-title", media.title.userPreferred);
		const type = DOM.create("div", "media-display-type", [media.type, ` (${media.startDate.year ?? "unreleased"})`]);
		info.append(title, type);
		this.element.append(poster, info);
	}
}
