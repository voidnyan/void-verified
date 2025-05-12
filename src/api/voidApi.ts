import {DOM} from "../utils/DOM";
import {StaticSettings} from "../utils/staticSettings";
import {IOption} from "../types/settings";
import {ButtonComponent} from "../components/ButtonComponent";

export interface ICreatePoll {
	title: string,
	options: ICreatePollOption[],
	allowMultipleVotes: boolean,
	closesAt?: Date | string,
}

export interface ICreatePollOption {
	description: string,
	link?: string,
}

export interface IVotePoll {
	pollId: number,
	optionId: number,
	isVoted: boolean
}

export interface IPoll {
	id: number,
	title: string,
	options: IPollOption[],
	allowMultipleVotes: boolean,
	closesAt?: Date
	isOwner: boolean,
	isClosed: boolean
}

export interface IPollOption {
	id: number,
	description: string,
	link?: string,
	voteCount: number,
	isVoted: boolean
}

export class VoidApiError extends Error {
	constructor(data: { error: string }) {
		super(data.error);
		this.name = "VoidAPIError";
	}
}

export class VoidApi {
	static token: string = localStorage.getItem("void-verified-api-token");

	static readonly clientId = "17382";
	static readonly callbackUrl = "https://voidnyan.net/auth/oauth"
	static readonly url = "https://voidnyan.net/api"

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
		const token = localStorage.getItem("void-verified-api-token");
		if (token) {
			// @ts-ignore
			headers.Authorization = "Bearer " + token;
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
			const button = new ButtonComponent("Remove auth token", () => {
				this.token = undefined;
				localStorage.removeItem("void-verified-api-token");
				button.element.replaceWith(this.createAuthButton());
			})
			container.append(button.element);
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
