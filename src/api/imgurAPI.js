import { ImageHostBase } from "./imageHostBase";
import { ImageHostService, imageHosts } from "./imageHostConfiguration";
import { DOM } from "../utils/DOM";
import { Toaster } from "../utils/toaster";
import { Label, Link, Note, SecretField } from "../components/components";

export class ImgurAPI extends ImageHostBase {
	#url = "https://api.imgur.com/3/image";
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

		if (!this.#configuration.clientId) {
			return;
		}

		const base64 = file.result.split("base64,")[1];

		const formData = new FormData();
		formData.append("image", base64);
		formData.append("title", image.name.split(".")[0]);

		const settings = {
			method: "POST",
			headers: {
				Authorization: this.#configuration.authToken
					? `Bearer ${this.#configuration.authToken}`
					: `Client-ID ${this.#configuration.clientId}`,
			},
			body: formData,
		};

		try {
			Toaster.debug("Uploading image to imgur.");
			const response = await fetch(this.#url, settings);
			const data = await response.json();
			Toaster.success("Uploaded image to imgur.");
			return data.data.link;
		} catch (error) {
			Toaster.error("Failed to upload image to imgur.");
			console.error("Failed to upload image to imgur.", error);
			return null;
		}
	}

	renderSettings(settingsUi) {
		const container = DOM.create("div");

		const clientId = Label(
			"Client ID",
			SecretField(this.#configuration?.clientId ?? "", (event) => {
				this.#updateConfig(event, "clientId", this.#configuration);
				settingsUi.renderSettingsUiContent();
			}),
		);

		const clientSecret = Label(
			"Client Secret",
			SecretField(this.#configuration?.clientSecret ?? "", (event) => {
				this.#updateConfig(event, "clientSecret", this.#configuration);
				settingsUi.renderSettingsUiContent();
			}),
		);

		container.append(clientId, clientSecret);

		if (
			this.#configuration.clientId &&
			this.#configuration.clientSecret &&
			!this.#configuration.authToken
		) {
			const authLink = DOM.create("a", null, "Authorize Imgur");
			authLink.classList.add("button");
			authLink.setAttribute(
				"href",
				`https://api.imgur.com/oauth2/authorize?client_id=${this.#configuration.clientId}&response_type=token`,
			);
			container.append(authLink);
		}

		if (this.#configuration.authToken) {
			const revokeAuthButton = DOM.create(
				"button",
				null,
				"Clear Authorization",
			);
			revokeAuthButton.classList.add("button");
			revokeAuthButton.addEventListener("click", () => {
				this.#revokeAuth();
				settingsUi.renderSettingsUiContent();
			});
			container.append(revokeAuthButton);
		}

		this.#renderNote(container);
		return container;
	}

	handleAuth() {
		const hash = window.location.hash.substring(1);
		if (!hash) {
			return;
		}

		const [path, token, expires, _, refreshToken] = hash.split("&");

		if (path !== "void_imgur") {
			return;
		}

		let config = { ...this.#configuration };
		config.authToken = token.split("=")[1];
		config.refreshToken = refreshToken.split("=")[1];

		config.expires = new Date(
			new Date().getTime() + Number(expires.split("=")[1]),
		);

		new ImageHostService().setImageHostConfiguration(
			imageHosts.imgur,
			config,
		);

		window.history.replaceState(
			null,
			"",
			"https://anilist.co/settings/developer",
		);
	}

	async refreshAuthToken() {
		if (
			!this.#configuration.refreshToken ||
			!this.#configuration.clientSecret ||
			!this.#configuration.clientId
		) {
			return;
		}

		if (new Date() < new Date(this.#configuration.expires)) {
			return;
		}

		const formData = new FormData();
		formData.append("refresh_token", this.#configuration.refreshToken);
		formData.append("client_id", this.#configuration.clientId);
		formData.append("client_secret", this.#configuration.clientSecret);
		formData.append("grant_type", "refresh_token");

		try {
			Toaster.debug("Refreshing imgur token.");
			const response = await fetch("https://api.imgur.com/oauth2/token", {
				method: "POST",
				body: formData,
			});
			if (!response.status === 200) {
				console.error("Failed to reauthorize Imgur");
				return;
			}
			const data = await response.json();
			const config = {
				...this.#configuration,
				authToken: data.access_token,
				expires: new Date(new Date().getTime() + data.expires_in),
			};
			new ImageHostService().setImageHostConfiguration(
				imageHosts.imgur,
				config,
			);
			Toaster.success("Refreshed imgur access token.");
		} catch (error) {
			Toaster.error("Error while refreshing imgur token.");
			console.error(error);
		}
	}

	#renderNote(container) {
		const note = Note("How to setup Imgur integration");

		const registerLink = Link(
			"api.imgur.com",
			"https://api.imgur.com/oauth2/addclient",
			"_blank",
		);
		const stepList = DOM.create("ol", null, [
			DOM.create("li", null, [
				"Register your application: ",
				registerLink,
				". Use 'https://anilist.co/settings/developer#void_imgur' as callback URL.",
			]),
			DOM.create(
				"li",
				null,
				"Fill the client id and secret fields with the value Imgur provided.",
			),
			DOM.create(
				"li",
				null,
				"Click on authorize (you can skip this step if you don't want images tied to your account).",
			),
		]);
		note.append(stepList);
		note.append(
			"Hitting Imgur API limits might get your API access blocked.",
		);

		container.append(note);
	}

	#revokeAuth() {
		const config = {
			...this.#configuration,
			authToken: null,
			refreshToken: null,
		};

		new ImageHostService().setImageHostConfiguration(
			imageHosts.imgur,
			config,
		);
	}

	#updateConfig(event, key, configuration) {
		const value = event.target.value;
		const config = {
			...configuration,
			[key]: value,
		};
		new ImageHostService().setImageHostConfiguration(
			imageHosts.imgur,
			config,
		);
	}
}
