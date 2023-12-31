export class AnilistAPI {
	apiQueryTimeoutInMinutes = 15;
	apiQueryTimeout = this.apiQueryTimeoutInMinutes * 60 * 1000;

	settings;
	#url = "https://graphql.anilist.co";
	constructor(settings) {
		this.settings = settings;
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
			return await error.json();
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
		let stopQueries = false;

		for (const user of this.#getUsersToQuery()) {
			if (stopQueries) {
				break;
			}

			stopQueries = this.#queryUser(user);
		}
	}

	#queryUser(user) {
		const variables = { username: user.username };
		const query = `query ($username: String) {
            User(name: $username) {
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

		let stopQueries = false;
		fetch(this.#url, options)
			.then(this.#handleResponse)
			.then((data) => {
				const resultUser = data.User;
				this.settings.updateUserFromApi(user, resultUser);
			})
			.catch((err) => {
				console.error(err);
				stopQueries = true;
			});

		return stopQueries;
	}

	#getQueryOptions(query, variables) {
		return {
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
	}

	#getMutationOptions(query, variables) {
		if (!this.settings.auth.token) {
			console.error("VoidVerified is not authenticated.");
			return;
		}
		let queryOptions = this.#getQueryOptions(query, variables);
		queryOptions.headers.Authorization = `Bearer ${this.settings.auth.token}`;
		return queryOptions;
	}

	#getUsersToQuery() {
		if (
			this.settings.options.copyColorFromProfile.getValue() ||
			this.settings.options.quickAccessEnabled.getValue()
		) {
			return this.#filterUsersByLastFetch();
		}

		const users = this.settings.verifiedUsers.filter(
			(user) => user.copyColorFromProfile || user.quickAccessEnabled
		);

		return this.#filterUsersByLastFetch(users);
	}

	#handleResponse(response) {
		return response.json().then((json) => {
			return response.ok ? json.data : Promise.reject(json);
		});
	}

	#filterUsersByLastFetch(users = null) {
		const currentDate = new Date();
		if (users) {
			return users.filter(
				(user) =>
					!user.lastFetch ||
					currentDate - new Date(user.lastFetch) >
						this.apiQueryTimeout
			);
		}
		return this.settings.verifiedUsers.filter(
			(user) =>
				!user.lastFetch ||
				currentDate - new Date(user.lastFetch) > this.apiQueryTimeout
		);
	}
}
