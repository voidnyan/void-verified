import { ImageHostBase } from "./imageHostBase";
import { DOM } from "../helpers/DOM";
import { Label, Note, SecretField } from "../components/components";
import { ImageHostService } from "./imageHostConfiguration";
import { Toaster } from "../utils/toaster";

class CatboxConfig {
	userHash;
	name = "catbox";
	constructor(config) {
		this.userHash = config?.userHash ?? "";
	}
}

export class CatboxAPI extends ImageHostBase {
	#url = "https://catbox.moe/user/api.php";
	#configuration;
	constructor(configuration) {
		super();
		this.#configuration = new CatboxConfig(configuration);
	}

	async uploadImage(image) {
		if (!image) {
			return;
		}

		const form = new FormData();
		form.append("reqtype", "fileupload");
		form.append("fileToUpload", image);

		if (this.#configuration.userHash !== "") {
			form.append("userhash", this.#configuration.userHash);
		}

		try {
			if (GM.xmlHttpRequest) {
				Toaster.debug("Uploading image to catbox.");
				const response = await GM.xmlHttpRequest({
					method: "POST",
					url: this.#url,
					data: form,
				});

				if (response.status !== 200) {
					console.error(response.response);
					throw new Error("Image upload to catbox failed.");
				}

				return response.response;
			}
		} catch (error) {
			Toaster.error("Failed to upload image to catbox.");
			return null;
		}
	}

	renderSettings() {
		const container = DOM.create("div");

		container.append(
			Label(
				"Userhash",
				SecretField(this.#configuration.userHash, (event) => {
					this.#updateUserhash(event, this.#configuration);
				})
			)
		);

		const p = Note(
			"Catbox.moe works out of the box, but you can provide your userhash to upload images to your account. Your userscript manager should promt you to allow xmlHttpRequest. This is required to upload images to Catbox on AniList."
		);
		container.append(p);
		return container;
	}

	#updateUserhash(event, configuration) {
		const userHash = event.target.value;
		const config = {
			...configuration,
			userHash,
		};
		new ImageHostService().setImageHostConfiguration(config.name, config);
	}
}
