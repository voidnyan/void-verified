export class AnilistAPI {
	apiQueryTimeoutInMinutes = 0.5;
	apiQueryTimeout = this.apiQueryTimeoutInMinutes * 60 * 1000;

	settings;
	#userId;
	#url = "https://graphql.anilist.co";
	#lastFetchedSessionStorage = "void-verified-last-fetched";
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
			const response = await fetch(this.#url, options);
			const result = await response.json();
			return result;
		} catch (error) {
			return await error.json();
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
			const response = await fetch(this.#url, options);
			const result = await response.json();
			return result.data;
		} catch (error) {
			return error;
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
			const response = await fetch(this.#url, options);
			const result = await response.json();
			return result.data;
		} catch (error) {
			return await error.json();
		}
	}

	queryUserData() {
		const lastFetched = new Date(
			sessionStorage.getItem(this.#lastFetchedSessionStorage)
		);
		const currentTime = new Date();

		if (!lastFetched || currentTime - lastFetched > this.apiQueryTimeout) {
			this.#querySelf();
			this.#queryUsers(1);
			sessionStorage.setItem(this.#lastFetchedSessionStorage, new Date());
		}
	}

	#querySelf() {
		const variables = { userId: this.#userId };
		const query = `query ($userId: Int!) {
                User(id: $userId) {
                  name
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

		fetch(this.#url, options)
			.then(this.#handleResponse)
			.then((data) => {
				this.settings.updateUserFromApi(data.User);
			})
			.catch((err) => {
				console.error(err);
			});
	}

	#queryUsers(page) {
		const variables = { page, userId: this.#userId };
		const query = `query ($page: Int, $userId: Int!) {
            Page(page: $page) {
                following(userId: $userId) {
                  name
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

		fetch(this.#url, options)
			.then(this.#handleResponse)
			.then((data) => {
				this.#handleQueriedUsers(data.Page.following);
				const pageInfo = data.Page.pageInfo;
				if (pageInfo.hasNextPage) {
					this.#queryUsers(pageInfo.currentPage + 1);
				}
			})
			.catch((err) => {
				console.error(err);
			});
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
		if (!this.settings.auth.token) {
			console.error("VoidVerified is not authenticated.");
			return;
		}
		let queryOptions = this.#getQueryOptions(query, variables);
		return queryOptions;
	}

	#handleResponse(response) {
		return response.json().then((json) => {
			return response.ok ? json.data : Promise.reject(json);
		});
	}
}
