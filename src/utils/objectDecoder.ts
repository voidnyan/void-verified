import LZString from "../libraries/lz-string";

export class ObjectDecoder {
	static decodeStringToObject(value) {
		let json = (value || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
		if (!json) {
			return {
				customCss: "",
			};
		}
		let jsonData;
		try {
			jsonData = JSON.parse(atob(json[1]));
		} catch (e) {
			jsonData = JSON.parse(LZString.decompressFromBase64(json[1]));
		}
		return jsonData;
	}

	static insertJsonToUserBio(about, json): string {
		const compressedJson = LZString.compressToBase64(
			JSON.stringify(json),
		);

		const target = about.match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/)?.[1];
		if (target) {
			about = about.replace(target, compressedJson);
		} else {
			about = `[](json${compressedJson})\n\n` + about;
		}
		return about;
	}
}
