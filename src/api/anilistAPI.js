export class AnilistAPI {
	apiQueryTimeoutInMinutes = 15;
	apiQueryTimeout = this.apiQueryTimeoutInMinutes * 60 * 1000;

	settings;
	constructor(settings) {
		this.settings = settings;
	}

	queryUserData() {
		this.#createUserQuery();
	}

	async #createUserQuery() {
		let stopQueries = false;

		for (const user of this.#getUsersToQuery()) {
			if (stopQueries) {
				break;
			}

			stopQueries = this.#queryUser(user);
		}
	}

	#userQuery = `
        query ($username: String) {
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

	#queryUser(user) {
		const variables = {
			username: user.username,
		};

		const url = "https://graphql.anilist.co";
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: this.#userQuery,
				variables,
			}),
		};

		let stopQueries = false;

		fetch(url, options)
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
