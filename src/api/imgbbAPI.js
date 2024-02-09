import { Toaster } from "../utils/toaster";
import { ImageHostBase } from "./imageHostBase";
import { ImageHostService } from "./imageHostConfiguration";

export class ImgbbAPI extends ImageHostBase {
	#url = "https://api.imgbb.com/1/upload";
	#configuration;
	constructor(configuration) {
		super();
		this.#configuration = configuration;
	}

	async uploadImage(image) {
		const file = await this.conventToBase64(image);
		if (!file.result) {
			return;
		}

		if (!this.#configuration.apiKey) {
			return;
		}

		const base64 = file.result.split("base64,")[1];

		const settings = {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body:
				"image=" +
				encodeURIComponent(base64) +
				"&name=" +
				image.name.split(".")[0],
		};

		try {
			Toaster.debug("Uploading image to imgbb.");
			const response = await fetch(
				`${this.#url}?key=${this.#configuration.apiKey}`,
				settings
			);
			const data = await response.json();
			Toaster.success("Uploaded image to imgbb.");
			return data.data.url;
		} catch (error) {
			Toaster.error("Failed to upload image to imgbb.");
			console.error(error);
			return null;
		}
	}

	renderSettings() {
		const container = document.createElement("div");
		const apiKeyInput = document.createElement("input");
		apiKeyInput.setAttribute("type", "text");

		const label = document.createElement("label");
		label.append("API key");
		label.setAttribute("class", "void-api-label");
		container.append(label);

		apiKeyInput.setAttribute("value", this.#configuration.apiKey);
		apiKeyInput.addEventListener("change", (event) =>
			this.#updateApiKey(event, this.#configuration)
		);
		apiKeyInput.setAttribute("class", "void-api-key");
		container.append(apiKeyInput);

		const note = document.createElement("div");
		note.append("You need to get the API key from the following link: ");

		note.setAttribute("class", "void-notice");

		const apiKeyLink = document.createElement("a");
		apiKeyLink.setAttribute("href", "https://api.imgbb.com/");
		apiKeyLink.append("api.imgbb.com");
		apiKeyLink.setAttribute("target", "_blank");
		note.append(apiKeyLink);

		container.append(note);

		return container;
	}

	#updateApiKey(event, configuration) {
		const apiKey = event.target.value;
		const config = {
			...configuration,
			apiKey,
		};
		new ImageHostService().setImageHostConfiguration(config.name, config);
	}
}
