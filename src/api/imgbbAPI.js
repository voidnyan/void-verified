import { InputField, Label, Link, Note } from "../components/components";
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

		const apiKey = Label(
			"API key",
			InputField(this.#configuration.apiKey, (event) => {
				this.#updateApiKey(event, this.#configuration);
			})
		);

		const note = Note(
			"You need to get the API key from the following link: "
		);
		note.append(Link("api.imgbb.com", "https://api.imgbb.com/", "_blank"));
		container.append(apiKey, note);

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
