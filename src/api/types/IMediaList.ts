import {IUser} from "./user";

export interface IMediaList {
	media: IMedia,
	user: IUser,
	notes: string,
	progress: number,
	repeat: number,
	id: number,
	status: string
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
