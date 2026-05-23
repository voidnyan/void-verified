export interface IMediaList {
	media: IMedia,
	notes: string,
	progress: number,
	id: number
}

export interface IMedia {
	title: {
		userPreferred: string
	},
	id: number,
	episodes?: number,
	chapters?: number,
	coverImage: {
		medium: string
	},
	type: string,
	airingSchedule: {
		nodes: IAiringSchedule[]
	},
}

export interface IAiringSchedule {
	episode: number,
	airingAt: number,
	timeUntilAiring: number
}
