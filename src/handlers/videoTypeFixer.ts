import {StaticSettings} from "../utils/staticSettings";

export const VideoExtensions = [
	{
		extension: ".av1",
		type: "av1"
	},
	{
		extension: ".mp4",
		type: "mp4"
	},
	{
		extension: ".avi",
		type: "x-msvideo"
	},
	{
		extension: ".mpeg",
		type: "mpeg"
	},
	{
		extension: ".ogg",
		type: "ogv"
	}
];

export class VideoTypeFixer {
	static fixVideoTypes() {
		if (!StaticSettings.options.fixVideoTypes.getValue()) {
			return;
		}

		for (const item of VideoExtensions) {
			this.fixMimeType(item.extension, item.type);
		}
	}

	private static fixMimeType(extension: string, type: string) {
		document.querySelectorAll(`source[src$="${extension}"][type="video/webm"]`).forEach(video => {
			video.setAttribute("type", `video/${type}`);
		});
	}
}
