import { ImageHostBase } from "./imageHostBase";
import { DOM } from "../helpers/DOM";

export class CatboxAPI extends ImageHostBase {
	#url = "https://catbox.moe/user/api.php";
	#configuration;
	constructor(configuration) {
		super();
		this.#configuration = configuration;
	}

	async uploadImage(image) {
		if (!image) {
			return;
		}

		const form = new FormData();
		form.append("reqtype", "fileupload");
		// form.append("userhash", "####");
		form.append("fileToUpload", image);

		const settings = {
			method: "PUT",
			mode: "cors",
			// headers: {
			// 	Accept: "application/json",
			// 	"Content-Type": "application/json",
			// },
			body: form,
		};

		try {
			const response = await fetch(`${this.#url}`, settings);
			console.log(response);
			const data = await response.json();
			console.log(data);
			return data;
		} catch (error) {
			console.error(error);
			return error;
		}
	}

	renderSettings() {
		const container = DOM.create("div");

		const p = DOM.create("p", null, "Catbox.moe works out of the box.");
		container.append(p);
		return container;
	}
}
