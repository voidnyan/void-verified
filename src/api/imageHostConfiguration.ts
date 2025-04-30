import {LocalStorageKeys} from "../assets/localStorageKeys";
import {DOM} from "../utils/DOM";
import {ImageApiFactory} from "./imageApiFactory";
import {Label, Option, Select} from "../components/components";

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
	private static configuration;
	static localStorage = LocalStorageKeys.imageHostConfig;

	private static settingContainer = DOM.createDiv();

	static initialize() {
		const config = JSON.parse(localStorage.getItem(this.localStorage));
		if (!config) {
			localStorage.setItem(
				this.localStorage,
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
			localStorage.setItem(this.localStorage, JSON.stringify(config));
		}

		this.configuration = config ?? imageHostConfiguration;
	}

	static getImageHostConfiguration(host: string) {
		return this.configuration.configurations[host];
	}

	static getSelectedHost(): string{
		return this.configuration.selectedHost;
	}

	static setSelectedHost(host: string) {
		this.configuration.selectedHost = host;
		localStorage.setItem(
			this.localStorage,
			JSON.stringify(this.configuration),
		);
	}

	static setImageHostConfiguration(host: string, config) {
		this.configuration.configurations[host] = config;
		localStorage.setItem(
			this.localStorage,
			JSON.stringify(this.configuration),
		);
	}

	static createImageHostSettings() {
		this.renderImageHostSettings();
		return this.settingContainer;
	}

	private static renderImageHostSettings() {
		this.settingContainer.replaceChildren();
		const imageHostOptions = Object.values(imageHosts).map((imageHost) =>
			Option(
				imageHost,
				imageHost === ImageHostService.getSelectedHost(),
				() => {
					ImageHostService.setSelectedHost(imageHost);
					this.renderImageHostSettings();
				},
			),
		);

		const select = Select(imageHostOptions);
		this.settingContainer.append(Label("Image host", select));

		const hostSpecificSettings = DOM.create("div");
		const imageHostApi = ImageApiFactory.getImageHostInstance();
		hostSpecificSettings.append(imageHostApi.renderSettings(this));

		this.settingContainer.append(hostSpecificSettings);
	}
}
