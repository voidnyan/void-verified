export const imageHosts = {
	imgbb: "imgbb",
	imgur: "imgur",
	catbox: "catbox",
};

const imageHostConfiguration = {
	selectedHost: imageHosts.catbox,
	configurations: {
		imgbb: {
			name: "imgbb",
			apiKey: "",
		},
		imgur: {
			name: "imgur",
			clientId: "",
			clientSecret: "",
			expires: null,
			refreshToken: null,
			authToken: null,
		},
		catbox: {
			name: "catbox",
			userHash: "",
		},
	},
};

export class ImageHostService {
	#configuration;
	#localStorage = "void-verified-image-host-config";
	constructor() {
		const config = JSON.parse(localStorage.getItem(this.#localStorage));
		if (!config) {
			localStorage.setItem(
				this.#localStorage,
				JSON.stringify(imageHostConfiguration),
			);
		} else {
			for (const key of Object.keys(
				imageHostConfiguration.configurations,
			)) {
				if (config.configurations[key]) {
					continue;
				}
				config.configurations[key] =
					imageHostConfiguration.configurations[key];
			}
			localStorage.setItem(this.#localStorage, JSON.stringify(config));
		}

		this.#configuration = config ?? imageHostConfiguration;
	}

	getImageHostConfiguration(host) {
		return this.#configuration.configurations[host];
	}

	getSelectedHost() {
		return this.#configuration.selectedHost;
	}

	setSelectedHost(host) {
		this.#configuration.selectedHost = host;
		localStorage.setItem(
			this.#localStorage,
			JSON.stringify(this.#configuration),
		);
	}

	setImageHostConfiguration(host, config) {
		this.#configuration.configurations[host] = config;
		localStorage.setItem(
			this.#localStorage,
			JSON.stringify(this.#configuration),
		);
	}
}
