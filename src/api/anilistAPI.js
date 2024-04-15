import { Toaster } from "../utils/toaster";

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

		const variables = { activityId };
		const options = this.#getQueryOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data.Activity;
		} catch (error) {
			throw new Error("Error querying activity.", error);
		}
	}

	async getUserAbout(username) {
		const query = `query ($username: String) {
            User(name: $username) {
                about
            }
        }`;

		const variables = { username };
		const options = this.#getQueryOptions(query, variables);
		try {
			const data = await this.#elevatedFetch(options);
			return data.User.about;
		} catch (error) {
			throw new Error("Error querying user about.", error);
		}
	}

	async saveUserAbout(about) {
		const query = `mutation ($about: String) {
            UpdateUser(about: $about) {
                about
            }
        }`;
		const variables = { about };
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

		const variables = { color };
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

		const variables = { text };
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
		const variables = { username };
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

	async selfMessage(message) {
		const variables = { message, recipientId: this.#userId };
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

		const variables = { activityIds };
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

	async #elevatedFetch(options) {
		try {
			const response = await fetch(this.#url, options);
			this.#setApiLimitRemaining(response);
			const data = await response.json();
			return data.data;
		} catch (error) {
			if (error instanceof TypeError) {
				console.log("reset:", error.headers?.get("X-RateLimit-Reset"));
				Toaster.warning(
					`Preflight check failed. This might be caused by too many requests. Last successful query returned ${this.#getApiLimitRemaining()} queries remaining.`,
				);
				console.error("Network error occured: ", error.message);
				console.log(
					`Last successful query by VoidVerified returned ${this.#getApiLimitRemaining()} queries remaining.`,
				);
			}
			throw new error();
		}
	}

	async #queryUsers(page) {
		const variables = { page, userId: this.#userId };
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
		sessionStorage.setItem(
			"void-verified-api-limit-remaining",
			response.headers.get("X-RateLimit-Remaining"),
		);
	}

	#getApiLimitRemaining() {
		return sessionStorage.getItem("void-verified-api-limit-remaining");
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
