import {IUser} from "./user";
import {IActivityReply} from "../queries/queryActivityReplies";

export interface IMessageActivity {
	message?: string,
	messenger?: IUser,
	recipient?: IUser,
	id?: number,
	createdAt?: number,
	isLiked?: boolean,
	isSubscribed?: boolean,
	likeCount?: number,
	replyCount?: number,
	likes?: IUser[],
	type: "MESSAGE",
	replies: IActivityReply[]
}
