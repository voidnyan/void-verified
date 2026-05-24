import {imageHosts, ImageHostService} from "../api/imageHostConfiguration";
import {ImgurAPI} from "../api/imgurAPI";
import {DOM} from "./DOM";
import {StaticSettings} from "./staticSettings";
import {VoidApi} from "../api/voidApi";
import {Dialog} from "./dialog";

export class AnilistAuth {
	private static storageAuth = "void-verified-auth";
	static token: string = null;
	static expires: Date = null;

	static name: string;
	static id: number;

	private static settingsContainer = DOM.createDiv();

	static async initialize() {
		const auth = await this.getStoredAuth();
		if (auth) {
			this.token = auth.token;
			this.expires = new Date(auth.expires);
			const currentDate = new Date();
			if (this.expires < currentDate) {
				Dialog.inform("Your AniList authorization token has expired. VoidVerified uses this token to make API calls on your behalf. Go to VoidVerified settings to reauthorize VoidVerified.",
					"AniList Authorization Expired");
				this.token = null;
				this.expires = null;
				await GM.deleteValue(this.storageAuth);
			}
		}


		const alAuth = JSON.parse(localStorage.getItem("auth"));
		this.name = alAuth?.name;
		this.id = alAuth?.id;
	}

	private static async getStoredAuth() {
		const storedAuth = await GM.getValue(this.storageAuth);
		if (typeof storedAuth === "string") {
			return JSON.parse(storedAuth) ?? null;
		}

		const localStorageAuth = localStorage.getItem(this.storageAuth);
		if (localStorageAuth) {
			await GM.setValue(this.storageAuth, localStorageAuth);
			localStorage.removeItem(this.storageAuth);
			return JSON.parse(localStorageAuth) ?? null;
		}

		return null;
	}

	static async checkAuthFromUrl() {
		const hash = window.location.hash.substring(1);
		if (!hash) {
			return;
		}

		const [path, token, type, expiress] = hash.split("&");

		if (path === "void_imgur") {
			const imgurConfig =
				ImageHostService.getImageHostConfiguration(
					imageHosts.imgur,
				);
			new ImgurAPI(imgurConfig).handleAuth();
		}

		if (path === "void_api_auth") {
			VoidApi.token = token;
			localStorage.setItem("void-verified-api-token", token);
		}

		if (path === "void_auth") {
			const expiresDate = new Date(
				new Date().getTime() + Number(expiress.split("=")[1]) * 1000,
			);

			await this.saveAuthToken({
				token: token.split("=")[1],
				expires: expiresDate,
			});
		}

		window.history.replaceState(
			null,
			"",
			"https://anilist.co/settings/developer",
		);
	}

	static async saveAuthToken(tokenObject: {token: string, expires: Date}) {
		this.token = tokenObject.token;
		this.expires = tokenObject.expires;
		await GM.setValue(this.storageAuth, JSON.stringify(tokenObject));
	}

	static createSettings() {
		this.renderSettings();
		return this.settingsContainer;
	}

	private static renderSettings() {
		this.settingsContainer.replaceChildren();
		const isAuthenticated =
			this.token !== null &&
			new Date(this.expires) > new Date();

		const clientId = 15519;

		const header = DOM.create("h3", null, "Authorize (AniList API)");
		const description = DOM.create(
			"p",
			null,
			"Some features of VoidVerified might need your access token to work correctly or fully. Below is a list of features using your access token. If you do not wish to use any of these features, you do not need to authorize. If revoking authentication, be sure to revoke VoidVerified from Anilist Apps as well.",
		);

		const list = DOM.create("ul");
		for (const option of Object.values(StaticSettings.options).filter(
			(o) => o.authRequired,
		)) {
			list.append(DOM.create("li", null, option.description));
		}

		// DOM.create uses Vue router so don't use that here
		const authLink = document.createElement("a");
		authLink.classList.add("void-button");
		authLink.append("Authorize VoidVerified");
		authLink.setAttribute(
			"href",
			`https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`,
		);

		const removeAuthButton = DOM.create(
			"button",
			null,
			"Revoke auth token",
		);
		removeAuthButton.classList.add("button");
		removeAuthButton.addEventListener("click", async () => {
			await this.removeAuthToken();
			this.renderSettings();
		});

		this.settingsContainer.append(header);
		this.settingsContainer.append(description);
		this.settingsContainer.append(list);
		this.settingsContainer.append(
			!isAuthenticated ? authLink : removeAuthButton,
		);


		this.settingsContainer.append(VoidApi.createSettings());
	}

	static async removeAuthToken() {
		this.token = null;
		this.expires = null;
		await GM.deleteValue(this.storageAuth);
	}
}
