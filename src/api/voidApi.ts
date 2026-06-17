import {DOM} from "../utils/DOM";
import {StaticSettings} from "../utils/staticSettings";
import {IOption} from "../types/settings";
import {ButtonComponent} from "../components/ButtonComponent";
import {ICreatePoll, IPoll, IVotePoll} from "./voidApi/types/pollInterfaces";
import {IAddGifDto, IGif} from "./voidApi/types/gifInterfaces";
import {IReadNotification} from "./voidApi/types/readNotificationInterfaces";
import {Dialog} from "../utils/dialog";
import {Note} from "../components/components";


export class VoidApiError extends Error {
	constructor(data: { error: string }) {
		super(data.error);
		this.name = "VoidAPIError";
	}
}

export class VoidApi {
	private static storageToken = "void-verified-api-token";
	static token: string = null;

	static readonly clientId = GM_info.script.version === "DEV" ? "26757" : "17382";
	static readonly callbackUrl = GM_info.script.version === "DEV" ? "https://localhost:7013/auth/oauth" : "https://voidnyan.net/auth/oauth";
	static readonly url = GM_info.script.version === "DEV" ? "https://localhost:7013/api" : "https://voidnyan.net/api";

	static async initialize() {
		this.token = await this.getStoredToken();
		if (this.token && this.isTokenExpired(this.token)) {
			Dialog.inform("Your VoidVerified API authorization token has expired. VoidVerified uses this token to make API calls on your behalf. Go to VoidVerified settings to reauthorize VoidVerified.",
				"VoidVerified API Authorization Expired");
			await this.removeAuthToken();
		}
	}

	private static async getStoredToken() {
		const storedToken = await GM.getValue(this.storageToken);
		if (typeof storedToken === "string") {
			return storedToken;
		}

		const localStorageToken = localStorage.getItem(this.storageToken);
		if (localStorageToken) {
			await GM.setValue(this.storageToken, localStorageToken);
			localStorage.removeItem(this.storageToken);
			return localStorageToken;
		}

		return null;
	}

	static async saveAuthToken(token: string) {
		this.token = token;
		await GM.setValue(this.storageToken, token);
	}

	static async removeAuthToken() {
		this.token = null;
		await GM.deleteValue(this.storageToken);
	}

	private static isTokenExpired(token: string) {
		const payload = this.parseJwtPayload(token);
		if (typeof payload?.exp !== "number") {
			return false;
		}

		return payload.exp * 1000 <= Date.now();
	}

	private static parseJwtPayload(token: string): { exp?: number } {
		try {
			const payload = token.split(".")[1];
			if (!payload) {
				return {};
			}

			const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
			const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
			return JSON.parse(atob(paddedBase64));
		} catch {
			return {};
		}
	}

	static async createPoll(poll: ICreatePoll): Promise<IPoll> {
		return await this.authPost("/polls/create-poll", poll);
	}

	static async vote(vote: IVotePoll): Promise<IPoll> {
		return await this.authPost("/polls/vote", vote);
	}

	static async getPoll(id: number): Promise<IPoll> {
		return await this.get(`/polls/get-poll/${id}`);
	}

	static async deletePoll(id: number): Promise<void> {
		return await this.authPost("/polls/delete-poll", {pollId: id});
	}

	static async addGifs(gifs: IAddGifDto[]): Promise<IGif[]> {
		return await this.authPost("/gifs/add-gifs", gifs);
	}

	static async getGifs(): Promise<IGif[]> {
		return await this.get("/gifs/get-gifs");
	}

	static async addGif(gif: IAddGifDto): Promise<void> {
		return await this.authPost("/gifs/add-gif", gif);
	}

	static async deleteGif(gif: IGif): Promise<void> {
		return await this.authPost("/gifs/delete-gif", gif);
	}

	static async getReadNotifications(lastSyncTime?: Date): Promise<IReadNotification[]> {
		let path = "/notifications";
		if (lastSyncTime) {
			path += `?lastSyncTime=${lastSyncTime}`;
		}
		return await this.get(path);
	}

	static async toggleReadNotifications(notificationIds: number[], isRead: boolean): Promise<void> {
		return await this.authPost("/notifications/toggleReadNotifications", {notificationIds, isRead});
	}

	private static async authPost(path: string, body: object) {
		const headers = {
			Authorization: "Bearer " + this.token,
			"Content-Type": "application/json"
		}

		const options = {
			method: "POST",
			headers,
			body: JSON.stringify(body)
		};

		const response = await fetch(this.url + path, options);
		return this.handleResponse(response);
	}

	private static async get(path) {
		const headers = {
			"Content-Type": "application/json"
		}
		if (this.token) {
			// @ts-ignore
			headers.Authorization = "Bearer " + this.token;
		}

		const options = {
			method: "GET",
			headers
		};

		const response = await fetch(this.url + path, options);
		return this.handleResponse(response);
	}

	private static async handleResponse(response: Response) {
		const data = await this.parse(response);
		if (!response.ok) {
			if (response.status === 401) {
				throw new VoidApiError({error: "Unauthorized"});
			}
			if (response.status === 429) {
				throw new VoidApiError({error: "Too Many Requests"});
			}
			console.error(data);
			throw new VoidApiError(data);
		}
		return data;
	}

	private static async parse(response: Response) {
		const text = await response?.text();
		if (text && text.trim() !== "") {
			return JSON.parse(text);
		}
		return null;
	}

	static createSettings(): HTMLDivElement {
		const container = DOM.createDiv();

		container.append(DOM.create("h3", null, "Authorize (VoidVerified API)"));
		container.append(DOM.create("p", null, "Some VoidVerified features might need you to authorize with VoidVerified's own API. Below is a list of features that use the API."));

		const list = DOM.create("ul");
		for (const option of Object.values(StaticSettings.options).filter((x: IOption) => x.voidApiAuthRequired)) {
			list.append(DOM.create("li", null, option.description));
		}

		container.append(list);

		container.append(
			DOM.create("p", null, ["VoidVerified API is not associated with AniList. Read our ",
				DOM.createAnchor("https://voidnyan.net/privacy", null, "Privacy Policy"),
				" and ",
				DOM.createAnchor("https://voidnyan.net/termsofservice", null, "Terms of Service"),
				" before usage."
			]),
		);

		container.querySelectorAll("a").forEach(x => x.setAttribute("target", "_blank"));

		if (this.token) {
			const button = new ButtonComponent("Remove auth token", async () => {
				await this.removeAuthToken();
				button.element.replaceWith(this.createAuthButton());
			})
			container.append(button.element);
			const parsedToken = this.parseJwtPayload(this.token);
			const expires = new Date(parsedToken.exp * 1000);
			const expiresNote = Note(`Auth expires ${expires}`);
			container.append(expiresNote);

		} else {
			container.append(this.createAuthButton());
		}

		return container;
	}

	private static createAuthButton() {
		const voidApiAuth = document.createElement("a");
		voidApiAuth.setAttribute("href", `https://anilist.co/api/v2/oauth/authorize?client_id=${VoidApi.clientId}&redirect_uri=${VoidApi.callbackUrl}&response_type=code`);
		voidApiAuth.append("Authenticate Void API");
		voidApiAuth.classList.add("void-button");
		return voidApiAuth;
	}
}
