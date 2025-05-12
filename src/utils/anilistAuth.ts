import {imageHosts, ImageHostService} from "../api/imageHostConfiguration";
import {ImgurAPI} from "../api/imgurAPI";
import {DOM} from "./DOM";
import {StaticSettings} from "./staticSettings";
import {ButtonComponent} from "../components/ButtonComponent";
import {VoidApi} from "../api/voidApi";

export class AnilistAuth {
	private static localStorageAuth = "void-verified-auth";
	static token: string = null;
	static expires: Date = null;

	static name: string;
	static id: number;

	private static settingsContainer = DOM.createDiv();

	static initialize() {
		const auth = JSON.parse(localStorage.getItem(this.localStorageAuth)) ?? null;
		if (auth) {
			this.token = auth.token;
			this.expires = new Date(auth.expires);
		}


		const alAuth = JSON.parse(localStorage.getItem("auth"));
		this.name = alAuth?.name;
		this.id = alAuth?.id;
	}

	static checkAuthFromUrl() {
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

			this.saveAuthToken({
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

	static saveAuthToken(tokenObject: {token: string, expires: Date}) {
		this.token = tokenObject.token;
		this.expires = tokenObject.expires;
		localStorage.setItem(
			this.localStorageAuth,
			JSON.stringify(tokenObject),
		);
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
		removeAuthButton.addEventListener("click", () => {
			this.removeAuthToken();
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

	static 	removeAuthToken() {
		this.token = null;
		this.expires = null;
		localStorage.removeItem(this.localStorageAuth);
	}
}
