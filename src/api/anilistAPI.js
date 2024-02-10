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
			console.log(data);
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

	async #elevatedFetch(options) {
		const runElevated = this.settings.options.useElevatedFetch.getValue();
		if (runElevated && GM.xmlHttpRequest) {
			try {
				const response = await GM.xmlHttpRequest({
					method: "POST",
					url: this.#url,
					data: options.body,
					headers: options.headers,
				});
				const data = JSON.parse(response.response);
				return data.data;
			} catch (error) {
				if (error.error.includes("Request was blocked by the user")) {
					Toaster.warning(
						"Elevated access has been enabled in the userscript settings but user has refused permissions to run it. Using regular fetch."
					);
				} else {
					Toaster.debug(
						"Could not query AniList API with elevated access. Using regular fetch."
					);
				}
				console.error(error);
			}
		}

		Toaster.error("this should not trigger");

		const response = await fetch(this.#url, options);
		const data = await response.json();
		return data.data;
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
				"Tried to make API query without authorizing VoidVerified. You can do so in the settings."
			);
			throw new Error("VoidVerified is missing auth token.");
		}
		let queryOptions = this.#getQueryOptions(query, variables);
		return queryOptions;
	}
}
