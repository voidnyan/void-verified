import {IUser} from "./user";
import {IActivityReply} from "../queries/queryActivityReplies";

export interface ITextActivity {
	text?: string,
	user?: IUser,
	id?: number,
	createdAt?: number,
	isLiked?: boolean,
	isSubscribed?: boolean,
	likeCount?: number,
	replyCount?: number,
	likes?: IUser[],
	type: "TEXT",
	replies: IActivityReply[]
}
