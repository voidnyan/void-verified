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

// [
// 	{
// 		"message": "Invalid token",
// 		"status": 400
// 	}
// ]

export class AnilistAPI {
	settings;
	#userId;
	#url = "https://graphql.anilist.co";

	constructor(settings) {
		this.settings = settings;
		this.#userId = Number(JSON.parse(localStorage.getItem("auth")).id);
	}

	async getActivityCss(activityId) {
		const query = `query ($activityId: Int) {
            Activity(id: $activityId) {
                ... on ListActivity {
                    user {
                        name
                        about
                        options {
                            profileColor
                        }
                }}
                ... on TextActivity {
                    user {
                        name
                        about
                        options {
                            profileColor
                        }
                    }
                }
                ... on MessageActivity {
                    recipient {
                        name
                        about
                        options {
                            profileColor
                        }
                    }
                }
            }
        }`;

		const variables = {activityId};
		const options = this.#getQueryOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data.Activity;
		} catch (error) {
			throw new Error("Error querying activity.", error);
		}
	}

	async getUserAbout(username) {
		const response = await this.getUserCssAndColour(username);
		return response?.about;
	}

	async getUserCssAndColour(username) {
		const query = `query ($username: String) {
            User(name: $username) {
                about
				options {
					profileColor
				}
            }
        }`;

		const variables = {username};
		const options = this.#getQueryOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data.User;
		} catch (error) {
			throw new Error("Error querying user about.", error);
		}
	}

	async getUserMediaListCollection(username, type) {
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
		const options = this.#getQueryOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return data;
	}

	async saveUserAbout(about) {
		const query = `mutation ($about: String) {
            UpdateUser(about: $about) {
                about
            }
        }`;
		const variables = {about};
		const options = this.#getMutationOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data;
		} catch (error) {
			throw new Error("failed to save user about.", error);
		}
	}

	async saveUserColor(color) {
		const query = `mutation ($color: String) {
            UpdateUser(profileColor: $color) {
                options {
                    profileColor
                }
            }
        }`;

		const variables = {color};
		const options = this.#getMutationOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data;
		} catch (error) {
			throw new Error("Failed to publish profile color", error);
		}
	}

	async saveDonatorBadge(text) {
		const query = `mutation ($text: String) {
            UpdateUser(donatorBadge: $text) {
                donatorBadge
            }
        }`;

		const variables = {text};
		const options = this.#getMutationOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data;
		} catch (error) {
			throw new Error("Failed to publish donator badge", error);
		}
	}

	async queryVerifiedUsers() {
		const accountUser = await this.queryUser(this.settings.anilistUser);
		this.settings.updateUserFromApi(accountUser);
		await this.#queryUsers(1);
	}

	async queryUser(username) {
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

		const options = this.#getQueryOptions(query, variables);

		try {
			const data = await this.#elevatedFetch(options);
			return data.User;
		} catch (error) {
			throw new Error("Failed to query user from Anilist API", error);
		}
	}

	async searchUsers(username: string): Promise<IUserSearchResult[]> {
		const variables = {search: username, perPage: 10};
		const query = SearchUsersQuery;
		const options = this.#getQueryOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return data.Page.users

	}

	async selfMessage(message) {
		const variables = {message, recipientId: this.#userId};
		const query = `
            mutation($recipientId: Int, $message: String) {
                SaveMessageActivity(message: $message, private: false, recipientId: $recipientId) {
                    id
                }
            }
        `;

		const options = this.#getMutationOptions(query, variables);

		try {
			const data = await this.#elevatedFetch(options);
			return data.SaveMessageActivity;
		} catch (error) {
			throw new Error("Failed to publish a self-message");
		}
	}

	async getNotifications(
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
		const options = this.#getMutationOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return [data.Page.notifications, data.Page.pageInfo];
		} catch (error) {
			console.error(error);
			throw new Error("Failed to query notifications.");
		}
	}

	async getActivityNotificationRelations(activityIds) {
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
		const options = this.#getMutationOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			const activities = new Set([
				...data.public.activities,
				...data.following.activities,
			]);
			return Array.from(activities);
		} catch (error) {
			console.error(error);
			throw new Error("Failed to query activities.");
		}
	}

	async resetNotificationCount() {
		const query = `query {
            Page(page: 1, perPage: 1) {
                notifications(resetNotificationCount: true) {
                    __typename
                }
            }
        }`;

		const options = this.#getMutationOptions(query, {});
		try {
			const data = await this.#elevatedFetch(options);
			return data;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to reset notification count.");
		}
	}

	async searchMedia(searchword) {
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
		const options = this.#getMutationOptions(query, {searchword});
		try {
			const data = await this.#elevatedFetch(options);
			return data.Page.media;
		} catch (error) {
			throw new Error(`Failed to query media (${searchword})`);
		}
	}

	async getMediaProgress(mediaId) {
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

		const options = this.#getMutationOptions(query, {mediaId, userId: this.#userId})
		try {
			const data = await this.#elevatedFetch(options);
			return data.MediaList;
		} catch (error) {
			throw new Error(`Failed to query media progress with media id ${mediaId}`);
		}
	}

	async updateMediaProgress(id, mediaId, status, progress) {
		const query = `mutation ($id: Int, $mediaId: Int, $status: MediaListStatus, $progress: Int) {
			  SaveMediaListEntry(id: $id, mediaId: $mediaId, status: $status, progress: $progress) {
				id
			  }
			}
		`;

		const options = this.#getMutationOptions(query, {id, status, progress, mediaId})
		try {
			const data = await this.#elevatedFetch(options);
			return data.MediaList;
		} catch (error) {
			throw new Error(`Failed to update media progress with media id ${mediaId}`);
		}
	}

	async getCreatedMediaActivity(mediaId) {
		const query = `query ($userId: Int, $mediaId: Int) {
				Activity(userId: $userId, mediaId: $mediaId, sort: ID_DESC, type_in: [ANIME_LIST, MANGA_LIST]) {
					... on ListActivity {
					  id
					}
				  }
				}`;

		const options = this.#getMutationOptions(query, {mediaId, userId: this.#userId})
		try {
			const data = await this.#elevatedFetch(options);
			return data.Activity;
		} catch (error) {
			throw new Error(`Failed to get created media activity with media id ${mediaId}`);
		}
	}

	async replyToActivity(activityId: number, reply: string): Promise<IActivityReply> {
		// return {
		// 	"activityId": 878490823,
		// 	"createdAt": 1743352496,
		// 	"id": 14509737,
		// 	"likeCount": 0,
		// 	"likes": [],
		// 	"isLiked": false,
		// 	"text": "reply.",
		// 	"user": {
		// 		"avatar": {
		// 			"large": "https://s4.anilist.co/file/anilistcdn/user/avatar/large/b5953162-oJ32skvShWpp.png"
		// 		},
		// 		"name": "voidnyan"
		// 	}
		// };
		const query = replyToActivityQuery;

		const options = this.#getMutationOptions(query, {activityId, text: reply});
		try {
			const data = await this.#elevatedFetch(options);
			console.log("API", data);
			return data.SaveActivityReply;
		} catch (error) {
			throw new Error(`Failed to reply to activity with id ${activityId}`);
		}
	}

	async getMiniProfile(username, numberOfFavourites) {
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

		const options = this.#getQueryOptions(query, variables);

		const data = await this.#elevatedFetch(options);
		return data.User;
	}

	async queryMessages(isFollowing: boolean, page = 1): Promise<{activities: IMessageActivity[], pageInfo: IPageInfo}> {
		const query = queryMessages;

		const variables = {isFollowing, type: "MESSAGE", sort: "ID_DESC", asHtml: false, page, perPage: 25};
		const options = this.#getQueryOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return {
			activities: data.Page.activities,
			pageInfo: data.Page.pageInfo
		};
	}

	async queryActivityReplies(id: number, page: number = 1): Promise<{
		replies: IActivityReply[],
		pageInfo: IPageInfo
	}> {
		const query = queryActivityReplies;

		const variables = {activityId: id, perPage: 50, page};
		const options = this.#getQueryOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return {
			replies: data.Page.activityReplies,
			pageInfo: data.Page.pageInfo
		};
	}

	async saveActivityText(type: "TEXT" | "MESSAGE" | "REPLY", id: number, content: string) {
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

		const options = this.#getMutationOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return data.SaveActivityReply ?? data.SaveMessageActivity ?? data.SaveTextActivity;
	}

	async deleteActivity(type: "ACTIVITY" | "REPLY", id: number): Promise<boolean> {
		const query = type === "ACTIVITY" ? DeleteActivityQuery : DeleteActivityReplyQuery;
		const variables = {id};
		const options = this.#getMutationOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return data.DeleteActivityReply?.deleted ?? data.DeleteActivity?.deleted;
	}

	async toggleLike(id: number, type: "ACTIVITY" | "ACTIVITY_REPLY" | "THREAD" | "THREAD_COMMENT"): Promise<IToggleLike> {
		const query = toggleLike;

		const variables = {toggleLikeV2Id: id, type};
		const options = this.#getMutationOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return data.ToggleLikeV2;
	}

	async toggleActivitySubscription(id: number, subscribe: boolean): Promise<IToggleActivitySubscription> {
		const query = toggleActivitySubscription;

		const variables = {activityId: id, subscribe};
		const options = this.#getMutationOptions(query, variables);
		const data = await this.#elevatedFetch(options);
		return data.ToggleActivitySubscription;
	}

	async query(query: string, params: object): Promise<any> {
		const options = this.#getQueryOptions(query, params);
		const data = await this.#elevatedFetch(options);
		return data;
	}

	async #elevatedFetch(options) {
		// const runElevated = this.settings.options.useElevatedFetch.getValue();
		// if (runElevated && GM.xmlHttpRequest) {
		// 	try {
		// 		const response = await GM.xmlHttpRequest({
		// 			method: "POST",
		// 			url: this.#url,
		// 			data: options.body,
		// 			headers: options.headers,
		// 		});
		// 		const data = JSON.parse(response.response);
		// 		console.log(
		// 			"remaining",
		// 			this.#parseStringHeaders(response.responseHeaders)[
		// 				"x-ratelimit-remaining"
		// 			],
		// 		);
		// 		return data.data;
		// 	} catch (error) {
		// 		if (error.error?.includes("Request was blocked by the user")) {
		// 			Toaster.warning(
		// 				"Elevated access has been enabled in the userscript settings but user has refused permissions to run it.",
		// 			);
		// 		}
		// 		console.error(error);
		// 		throw error;
		// 	}
		// }

		return await this.#regularFetch(options);
	}

	async #regularFetch(options) {
		try {
			const response = await fetch(this.#url, options);
			this.#setApiLimitRemaining(response);
			const data = await response.json();
			if (data.errors) {
				console.error(data.errors);
			}
			return data.data;
		} catch (error) {
			console.error(error);
			if (error instanceof TypeError) {
				// @ts-ignore
				console.log("reset:", error.headers?.get("X-RateLimit-Reset"));
				Toaster.warning(
					`Preflight check failed. This might be caused by too many requests. Last successful query returned ${this.#getApiLimitRemaining()} queries remaining.`,
				);
				console.error("Network error occured: ", error.message);
				console.log(
					`Last successful query by VoidVerified returned ${this.#getApiLimitRemaining()} queries remaining.`,
				);
			}
			throw error;
		}
	}

	#parseStringHeaders(responseHeaders) {
		const headersArray = responseHeaders.split("\r\n");
		const headers = {};
		headersArray
			.filter((x) => x !== "")
			.forEach((headerRow) => {
				const [key, value] = headerRow.split(":");
				headers[key] = value.trim();
			});
		return headers;
	}

	async #queryUsers(page) {
		const variables = {page, userId: this.#userId};
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

		const options = this.#getQueryOptions(query, variables);

		try {
			const data = await this.#elevatedFetch(options);
			this.#handleQueriedUsers(data.Page.following);
			const pageInfo = data.Page.pageInfo;
			if (pageInfo.hasNextPage) {
				await this.#queryUsers(pageInfo.currentPage + 1);
			}
		} catch (error) {
			throw new Error("Failed to query followed users.", error);
		}
	}

	#handleQueriedUsers(users) {
		for (const user of users) {
			this.settings.updateUserFromApi(user);
		}
	}

	#getQueryOptions(query, variables) {
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

		if (this.settings.auth?.token) {
			// @ts-ignore
			options.headers.Authorization = `Bearer ${this.settings.auth.token}`;
		}

		return options;
	}

	#getMutationOptions(query, variables) {
		if (!this.settings.auth?.token) {
			Toaster.error(
				"Tried to make API query without authorizing VoidVerified. You can do so in the settings.",
			);
			throw new Error("VoidVerified is missing auth token.");
		}
		let queryOptions = this.#getQueryOptions(query, variables);
		return queryOptions;
	}

	#setApiLimitRemaining(response) {
		localStorage.setItem(
			"void-verified-api-limit-remaining",
			response.headers.get("X-RateLimit-Remaining"),
		);
	}

	#getApiLimitRemaining() {
		return localStorage.getItem("void-verified-api-limit-remaining");
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
