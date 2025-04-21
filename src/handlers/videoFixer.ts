import {StaticSettings} from "../utils/staticSettings";
import {DOM} from "../utils/DOM";

export class VideoFixer {
	static replaceVideosWithLinks() {
		if (!StaticSettings.options.replaceVideosWithLinksEnabled.getValue()) {
			return;
		}

		document.querySelectorAll(".markdown video source").forEach(s => {
			const source = s as HTMLSourceElement;
			const video = source.parentElement as HTMLVideoElement;
			const a = DOM.create("a", "video-link", "Play Video");
			a.setAttribute("href", source.src);
			video.replaceWith(a);
		});
	}
}
