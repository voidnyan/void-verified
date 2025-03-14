import {IUser} from "./user";
import {IActivityReply} from "../queries/queryActivityReplies";

export interface IListActivity {
	id?: number,
	createdAt?: number,
	isLiked?: boolean,
	isSubscribed?: boolean,
	likeCount?: number,
	replyCount?: number,
	likes?: IUser[],
	media: {
		id
		coverImage: {
			large: string
		},
		type: "ANIME" | "MANGA",
		title: {
			userPreferred: string
		}
	}
	progress: string,
	status: string,
	type: "ANIME_LIST" | "MANGA_LIST",
	user: IUser,
	replies: IActivityReply[]
}
