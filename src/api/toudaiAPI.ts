export interface ILighthouseSighting {
	anilist_link: string | null;
	date_spotted: string;
	episode: string | null;
	id: number;
	image_link: string[];
	lighthouse_id: number | null;
	lighthouse_type: string;
	lighthouses: ILighthouse | null;
	media_id: string | null;
	media_type: string;
	notes: string | null;
	timestamp: string | null;
	title_en: string | null;
	title_jp: string | null;
	title_r: string | null;
}

interface ILighthouse {
	id: number;
	name_en: string | null;
	name_jp: string | null;
	notes_l: string | null;
	wiki_en: string | null;
	wiki_jp: string | null;
	google_maps_link: string | null;
	lighthouse_japan_link: string | null;
	prefecture: string | null;
}

export class ToudaiApiError extends Error {
	constructor(data: {error: string}) {
		super(data.error);
		this.name = "ToudaiAPIError";
	}
}

export class ToudaiAPI {
	private static url = "https://ogningqqgxhwkmozikmu.supabase.co/rest/v1";
	private static apiKey = "sb_publishable_Q9SEFHhKlsG05lL4dmrSqw_hwbvmEAB";

	static async getLighthouseBySightingId(id: number): Promise<ILighthouseSighting> {
		const path = `/sightings?id=eq.${id}&select=*,lighthouses(*)`;
		const result = await this.get(path);
		return result[0] as ILighthouseSighting;
	}

	static async getLighthouseSightingsByMediaId(mediaId: number): Promise<ILighthouseSighting[]> {
		const path = `/sightings?media_id=eq.${mediaId}&select=*,lighthouses(*)`;
		return await this.get(path) as ILighthouseSighting[];
	}

	private static async get(path: string) {
		const headers = {
			"Content-Type": "application/json",
			"Authorization": this.apiKey,
			"apikey": this.apiKey
		};

		const options = {
			method: "GET",
			headers
		};

		const response = await fetch(this.url + path, options);
		return await this.handleResponse(response);
	}
	private static async handleResponse(response: Response) {
		const data = await this.parse(response);
		if (!response.ok) {
			console.error(data);
			throw new ToudaiApiError(data);
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
}
