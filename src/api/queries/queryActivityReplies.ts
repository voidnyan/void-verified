import {IUser} from "../types/user";

export const ActivityReplyQueryPartial = `createdAt
			  isLiked
			  id
			  likeCount
			  likes {
				avatar {
				  large
				}
				name
			  }
			  text
			  user {
			  	id
				avatar {
				  large
				}
				name
			  }`;

export default `query ActivityReplies($activityId: Int, $page: Int, $perPage: Int) {
		  Page(page: $page, perPage: $perPage) {
			activityReplies(activityId: $activityId) {
				${ActivityReplyQueryPartial}
			}
			pageInfo {
			  hasNextPage
			  currentPage
			  perPage
			  total
			}
		  }
		}`;

export interface IActivityReply {
	createdAt: number,
	isLiked: boolean,
	id: number,
	likeCount: number,
	likes: IUser[],
	text: string,
	user: IUser
}
