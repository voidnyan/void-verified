import {Toaster} from "../utils/toaster";
import toggleActivitySubscription, {IToggleActivitySubscription} from "./queries/toggleActivitySubscription";
import toggleLike, {IToggleLike} from "./queries/toggleLike";
import queryActivityReplies, {IActivityReply} from "./queries/queryActivityReplies";
import queryMessages from "./queries/queryMessages";
import {IMessageActivity} from "./types/messageActivity";
import replyToActivityQuery from "./queries/replyToActivityQuery";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {IUserSearchResult} from "./types/IUserSearchResult";
import SearchUsersQuery from "./queries/searchUsersQuery";
import {IPageInfo} from "./types/IPageInfo";
import SaveTextActivityMutation from "./queries/saveTextActivityMutation";
import SaveMessageActivityMutation from "./queries/saveMessageActivityMutation";
import SaveActivityReplyMutation from "./queries/saveActivityReplyMutation";
import DeleteActivityQuery from "./queries/deleteActivityQuery";
import DeleteActivityReplyQuery from "./queries/deleteActivityReplyQuery";
import {AnilistAuth} from "../utils/anilistAuth";
import {VerifiedUsers} from "../utils/verifiedUsers";
import {IUser} from "./types/user";

// [
// 	{
// 		"message": "Invalid token",
// 		"status": 400
// 	}
// ]

export class AnilistAPI {
	private static url = "https://graphql.anilist.co";

	static async getUserAbout(username: string): Promise<string> {
		const response = await this.getUserCssAndColour(username);
		return response?.about;
	}

	static async getUserCssAndColour(username) {
		const query = `query ($username: String) {
            User(name: $username) {
                about
				options {
					profileColor
				}
            }
        }`;

		const variables = {username};
		const options = this.getQueryOptions(query, variables);
		const data = await this.fetch(options);
		return data.User;
	}

	static async getUserMediaListCollection(username, type) {
		const query = `query Query($userName: String, $type: MediaType) {
		  MediaListCollection(userName: $userName, type: $type) {
			lists {
			  entries {
				completedAt {
				  year
				  month
				  day
				}
				startedAt {
				  year
				  month
				  day
				}
				media {
				  title {
					userPreferred
				  }
				  format
				  duration
				  id
				}
				status
				progress
				progressVolumes
			  }
			}
			user {
			  about
			}
		  }
		}`;
		const variables = {userName: username, type};
		const options = this.getQueryOptions(query, variables);
		const data = await this.fetch(options);
		return data;
	}

	static async saveUserAbout(about) {
		const query = `mutation ($about: String) {
            UpdateUser(about: $about) {
                about
            }
        }`;
		const variables = {about};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data;
	}

	static async saveUserColor(color) {
		const query = `mutation ($color: String) {
            UpdateUser(profileColor: $color) {
                options {
                    profileColor
                }
            }
        }`;

		const variables = {color};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data;
	}

	static async saveDonatorBadge(text) {
		const query = `mutation ($text: String) {
            UpdateUser(donatorBadge: $text) {
                donatorBadge
            }
        }`;

		const variables = {text};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data;
	}

	static async queryVerifiedUsers() {
		const accountUser = await this.queryUser(AnilistAuth.name);
		VerifiedUsers.updateUserFromApi(accountUser);
		await this.queryUsers(1);
	}

	static async queryUser(username) {
		const variables = {username};
		const query = `query ($username: String!) {
                User(name: $username) {
                  name
                  id
                  avatar {
                    large
                  }
                  bannerImage
                  options {
                    profileColor
                  }
              }
            }
        `;

		const options = this.getQueryOptions(query, variables);

		const data = await this.fetch(options);
		return data.User;
	}

	static async searchUsers(username: string): Promise<IUserSearchResult[]> {
		const variables = {search: username, perPage: 10};
		const query = SearchUsersQuery;
		const options = this.getQueryOptions(query, variables);
		const data = await this.fetch(options);
		return data.Page.users

	}

	static async selfMessage(message) {
		const variables = {message, recipientId: AnilistAuth.id};
		const query = `
            mutation($recipientId: Int, $message: String) {
                SaveMessageActivity(message: $message, private: false, recipientId: $recipientId) {
                    id
                }
            }
        `;

		const options = this.getMutationOptions(query, variables);

		const data = await this.fetch(options);
		return data.SaveMessageActivity;
	}

	static async getNotifications(
		notificationTypes,
		page = 1,
		resetNotificationCount = false,
	) {
		const query = `
        query($notificationTypes: [NotificationType], $page: Int, $resetNotificationCount: Boolean) {
            Page(page: $page) {
                notifications(type_in: $notificationTypes,
                    resetNotificationCount: $resetNotificationCount) {
                    ... on ActivityMessageNotification {${activityQuery}}
                    ... on ActivityReplyNotification {${activityQuery}}
                    ... on ActivityMentionNotification{${activityQuery}}
                    ... on ActivityReplySubscribedNotification{${activityQuery}}
                    ... on ActivityLikeNotification{${activityQuery}}
                    ... on ActivityReplyLikeNotification{${activityQuery}}
                    ... on FollowingNotification{${followingQuery}}
                    ... on AiringNotification{${airingQuery}}
                    ... on RelatedMediaAdditionNotification{${relatedMediaQuery}}
                    ... on ThreadCommentMentionNotification{${threadCommentQuery}}
                    ... on ThreadCommentReplyNotification{${threadCommentQuery}}
                    ... on ThreadCommentSubscribedNotification{${threadCommentQuery}}
                    ... on ThreadCommentLikeNotification{${threadCommentQuery}}
                    ... on ThreadLikeNotification{${threadQuery}}
                    ... on MediaDataChangeNotification{${mediaDataChange}}
                    ... on MediaDeletionNotification{${mediaDeleted}}
                }
                pageInfo {
                    currentPage
                    hasNextPage
                }
            }
        }`;

		const variables = {
			notificationTypes,
			page,
			resetNotificationCount,
		};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return [data.Page.notifications, data.Page.pageInfo];
	}

	static async getActivityNotificationRelations(activityIds) {
		const userQuery = `
            name
            avatar {
                large
            }`;

		const activitiesQuery = ` ... on ListActivity {
                id
                type
                media {
                    coverImage {large}
                    id
                    type
                    title {
                    	userPreferred
                	}
                }
            }
            ... on TextActivity {
                id
                type
                user {${userQuery}}
            }
            ... on MessageActivity {
                id
                type
                recipient {${userQuery}}
            }`;
		const query = `query($activityIds: [Int]) {
            public: Page(page: 1) {
                activities(id_in: $activityIds, isFollowing: true) {${activitiesQuery}}
            }
            following: Page(page: 1) {
                activities(id_in: $activityIds, isFollowing: false) {${activitiesQuery}}
            }
        }`;

		const variables = {activityIds};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		const activities = new Set([
			...data.public.activities,
			...data.following.activities,
		]);
		return Array.from(activities);
	}

	static async resetNotificationCount() {
		const query = `query {
            Page(page: 1, perPage: 1) {
                notifications(resetNotificationCount: true) {
                    __typename
                }
            }
        }`;

		const options = this.getMutationOptions(query, {});
		const data = await this.fetch(options);
		return data;
	}

	static async searchMedia(searchword) {
		const query = `query($searchword: String) {
            Page(page: 1, perPage: 10) {
                media(search: $searchword) {
                    id
                    title {
                        userPreferred
                    }
                    coverImage {
                        large
                    }
                    type
                    startDate {
                        year
                    }
                    episodes
                    chapters
                }
            }
        }`;
		const options = this.getMutationOptions(query, {searchword});
		const data = await this.fetch(options);
		return data.Page.media;
	}

	static async getMediaProgress(mediaId) {
		const query = `query($mediaId: Int, $userId: Int) {
			  MediaList(mediaId: $mediaId, userId: $userId) {
				id
				mediaId
				status
				progress
				media {title {
				  romaji
				  english
				  native
				  userPreferred
				}}
				media {
				  episodes
				  chapters
				}
			  }
			}`;

		const options = this.getMutationOptions(query, {mediaId, userId: AnilistAuth.id})
		const data = await this.fetch(options);
		return data.MediaList;
	}

	static async updateMediaProgress(id, mediaId, status, progress) {
		const query = `mutation ($id: Int, $mediaId: Int, $status: MediaListStatus, $progress: Int) {
			  SaveMediaListEntry(id: $id, mediaId: $mediaId, status: $status, progress: $progress) {
				id
			  }
			}
		`;

		const options = this.getMutationOptions(query, {id, status, progress, mediaId})
		const data = await this.fetch(options);
		return data.MediaList;
	}

	static async getCreatedMediaActivity(mediaId) {
		const query = `query ($userId: Int, $mediaId: Int) {
				Activity(userId: $userId, mediaId: $mediaId, sort: ID_DESC, type_in: [ANIME_LIST, MANGA_LIST]) {
					... on ListActivity {
					  id
					}
				  }
				}`;

		const options = this.getMutationOptions(query, {mediaId, userId: AnilistAuth.id})
		const data = await this.fetch(options);
		return data.Activity;
	}

	static async replyToActivity(activityId: number, reply: string): Promise<IActivityReply> {
		const query = replyToActivityQuery;

		const options = this.getMutationOptions(query, {activityId, text: reply});
		const data = await this.fetch(options);
		return data.SaveActivityReply;
	}

	static async getMiniProfile(username, numberOfFavourites) {
		const variables = {name: username, page: 1, perPage: numberOfFavourites};

		const query = `query User($name: String, $page: Int, $perPage: Int) {
			  User(name: $name) {
			    about
				avatar {
				  large
				}
				createdAt
				donatorBadge
				favourites {
				  anime(page: $page, perPage: $perPage) {
					nodes {
					  coverImage {
						large
					  }
					  title {
						userPreferred
					  }
					  id
					  type
					}
				  }
				manga(page: $page, perPage: $perPage) {
					nodes {
					  coverImage {
						large
					  }
					  title {
						userPreferred
					  }
					  id
					  type
					}
				  }
				  characters(page: $page, perPage: $perPage) {
					nodes {
					  name {
						userPreferred
					  }
					  image {
						large
					  }
					  id
					}
				  }
				  staff(page: $page, perPage: $perPage) {
					nodes {
					  name {
						userPreferred
					  }
					  image {
						large
					  }
					  id
					}
				  }
				}
				name
				isFollower
				isFollowing
				options {
				  profileColor
				}
				bannerImage
				donatorTier
			  }
			}`;

		const options = this.getQueryOptions(query, variables);

		const data = await this.fetch(options);
		return data.User;
	}

	static async queryMessages(isFollowing: boolean, page = 1): Promise<{
		activities: IMessageActivity[],
		pageInfo: IPageInfo
	}> {
		const query = queryMessages;

		const variables = {isFollowing, type: "MESSAGE", sort: "ID_DESC", asHtml: false, page, perPage: 25};
		const options = this.getQueryOptions(query, variables);
		const data = await this.fetch(options);
		return {
			activities: data.Page.activities,
			pageInfo: data.Page.pageInfo
		};
	}

	static async queryActivityReplies(id: number, page: number = 1): Promise<{
		replies: IActivityReply[],
		pageInfo: IPageInfo
	}> {
		const query = queryActivityReplies;

		const variables = {activityId: id, perPage: 50, page};
		const options = this.getQueryOptions(query, variables);
		const data = await this.fetch(options);
		return {
			replies: data.Page.activityReplies,
			pageInfo: data.Page.pageInfo
		};
	}

	static async saveActivityText(type: "TEXT" | "MESSAGE" | "REPLY", id: number, content: string) {
		let query;
		switch (type) {
			case "TEXT":
				query = SaveTextActivityMutation;
				break;
			case "MESSAGE":
				query = SaveMessageActivityMutation;
				break;
			case "REPLY":
				query = SaveActivityReplyMutation;
				break;
			default:
				throw new Error("Unsupported type " + type);
		}

		const variables = {
			id,
			content
		};

		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data.SaveActivityReply ?? data.SaveMessageActivity ?? data.SaveTextActivity;
	}

	static async deleteActivity(type: "ACTIVITY" | "REPLY", id: number): Promise<boolean> {
		const query = type === "ACTIVITY" ? DeleteActivityQuery : DeleteActivityReplyQuery;
		const variables = {id};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data.DeleteActivityReply?.deleted ?? data.DeleteActivity?.deleted;
	}

	static async toggleLike(id: number, type: "ACTIVITY" | "ACTIVITY_REPLY" | "THREAD" | "THREAD_COMMENT"): Promise<IToggleLike> {
		const query = toggleLike;

		const variables = {toggleLikeV2Id: id, type};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data.ToggleLikeV2;
	}

	static async toggleActivitySubscription(id: number, subscribe: boolean): Promise<IToggleActivitySubscription> {
		const query = toggleActivitySubscription;

		const variables = {activityId: id, subscribe};
		const options = this.getMutationOptions(query, variables);
		const data = await this.fetch(options);
		return data.ToggleActivitySubscription;
	}

	static async query(query: string, params: object): Promise<any> {
		const options = this.getQueryOptions(query, params);
		const data = await this.fetch(options);
		return data;
	}

	private static async fetch(options) {
		try {
			const response = await fetch(this.url, options);
			this.setApiLimitRemaining(response);

			const data = await response.json();

			if (!response.ok) {
				let message = "Internal Server Error";

				// The API seems to return 500 with message (bad request) sometimes
				// to not make this confusing for the user, replace the message that ends up in UI
				if (response.status !== 500) {
					message = data?.errors?.map(x => x.message)?.join(", ");
				}
				throw new AnilistAPIError([{
					status: response.status,
					message: message
				}])
			}

			if (data.errors) {
				throw new AnilistAPIError(data.errors);
			}
			return data.data;
		} catch (error) {
			if (error instanceof AnilistAPIError) {
				console.error("Anilist API returned error: ", error.errors);
			} else if (!(error instanceof AnilistAPIError)) {
				console.error(error);
			}
			throw error;
		}
	}

	private static async queryUsers(page) {
		const variables = {page, userId: AnilistAuth.id};
		const query = `query ($page: Int, $userId: Int!) {
            Page(page: $page) {
                following(userId: $userId) {
                  name
                  id
                  avatar {
                    large
                  }
                  bannerImage
                  options {
                    profileColor
                  }
                },
                pageInfo {
                  total
                  perPage
                  currentPage
                  lastPage
                  hasNextPage
                }
              }
            }
        `;

		const options = this.getQueryOptions(query, variables);

		const data = await this.fetch(options);
		this.handleQueriedUsers(data.Page.following);
		const pageInfo = data.Page.pageInfo;
		if (pageInfo.hasNextPage) {
			await this.queryUsers(pageInfo.currentPage + 1);
		}
	}

	private static handleQueriedUsers(users) {
		for (const user of users) {
			VerifiedUsers.updateUserFromApi(user);
		}
	}

	private static getQueryOptions(query, variables) {
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query,
				variables,
			}),
		};

		if (AnilistAuth.token) {
			// @ts-ignore
			options.headers.Authorization = `Bearer ${AnilistAuth.token}`;
		}

		return options;
	}

	private static getMutationOptions(query, variables) {
		if (!AnilistAuth.token) {
			Toaster.error(
				"Tried to make API query without authorizing VoidVerified. You can do so in the settings.",
			);
			throw new Error("VoidVerified is missing auth token.");
		}
		let queryOptions = this.getQueryOptions(query, variables);
		return queryOptions;
	}

	private static setApiLimitRemaining(response: Response) {
		const apiLimitOffset = 60;
		// @ts-ignore
		const remaining = response.headers.get("X-RateLimit-Remaining") - apiLimitOffset;
		if (remaining < 5 && remaining >= 0) {
			Toaster.warning(`Remaining queries before reset: ${remaining}`);
		}
		localStorage.setItem(
			"void-verified-api-limit-remaining",
			remaining.toString()
		);
	}
}

const userQuery = `user {
    name
    avatar {
        large
    }
}`;

const mediaQuery = `media {
    title {
        userPreferred
    }
    coverImage {
        large
    }
    id
    type
}`;

const activityQuery = `activityId
    type
    id
    ${userQuery}
    createdAt
    context`;

const followingQuery = `type
    id
    context
    createdAt
    ${userQuery}
    `;

const airingQuery = `type
    id
    contexts
    createdAt
    ${mediaQuery}
    episode
    `;

const relatedMediaQuery = `type
    id
    ${mediaQuery}
    context
    createdAt`;

const threadQuery = `type
    id
    context
    threadId
    thread {title}
    ${userQuery}
    createdAt`;

const threadCommentQuery = `type
    id
    context
    thread {
        id
        title
    }
    commentId
    ${userQuery}
    createdAt`;

const mediaDataChange = `type
    id
    context
    ${mediaQuery}
    reason
    createdAt
    `;

const mediaDeleted = `type
    id
    context
    reason
    deletedMediaTitle
    createdAt`;

export interface IAnilistAPIError {
	message: string;
	status: number;
}

export class AnilistAPIError extends Error {
	public readonly errors: IAnilistAPIError[]

	constructor(errors: IAnilistAPIError[]) {
		super();
		this.errors = errors;
		this.name = "AnilistAPIError";
	}
}
