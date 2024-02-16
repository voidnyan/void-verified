import { DOM } from "./DOM";
import { Select, Toast, Option, Button, Label } from "../components/components";

export const toastTypes = {
	info: "info",
	success: "success",
	warning: "warning",
	error: "error",
};

export const toastLevels = {
	info: 0,
	success: 1,
	warning: 2,
	error: 3,
};

const toastDurations = [1, 3, 5, 10];

const toastLocations = ["top-left", "top-right", "bottom-left", "bottom-right"];

export class ToasterConfig {
	toastLevel;
	duration;
	location;
	constructor(config) {
		this.toastLevel = config?.toastLevel ?? 2;
		this.duration = config?.duration ?? 5;
		this.location = config?.location ?? "bottom-left";
	}
}

class ToastInstance {
	type;
	message;
	duration;
	// durationLeft;
	// interval;
	constructor(message, type, duration) {
		this.type = type;
		this.message = message;
		this.duration = duration * 1000;
	}

	toast() {
		const toast = Toast(this.message, this.type);
		this.durationLeft = this.duration;
		// This code can be used for a visual indicator

		// this.interval = setInterval(
		// 	(toast) => {
		// 		if (this.durationLeft <= 0) {
		// 			this.delete(toast);
		// 			clearInterval(this.interval);
		// 			return;
		// 		}
		// 		this.durationLeft -= 100;
		// 	},
		// 	100,
		// 	toast
		// );

		setTimeout(() => {
			this.delete(toast);
		}, this.duration);
		return toast;
	}

	delete(toast) {
		toast.remove();
	}
}

export class Toaster {
	static #config;
	static #configInLocalStorage = "void-verified-toaster-config";
	static #settings;
	static initializeToaster(settings) {
		this.#settings = settings;
		const config = JSON.parse(
			localStorage.getItem(this.#configInLocalStorage)
		);
		this.#config = new ToasterConfig(config);
		const toastContainer = DOM.create(
			"div",
			`#toast-container ${this.#config.location}`
		);
		document.body.append(toastContainer);
	}

	static debug(message) {
		if (!this.#shouldToast(toastTypes.info)) {
			return;
		}
		DOM.get("#void-toast-container").append(
			new ToastInstance(
				message,
				toastTypes.info,
				this.#config.duration
			).toast()
		);
	}

	static success(message) {
		if (!this.#shouldToast(toastTypes.success)) {
			return;
		}

		DOM.get("#void-toast-container").append(
			new ToastInstance(
				message,
				toastTypes.success,
				this.#config.duration
			).toast()
		);
	}

	static warning(message) {
		if (!this.#shouldToast(toastTypes.warning)) {
			return;
		}

		DOM.get("#void-toast-container").append(
			new ToastInstance(
				message,
				toastTypes.warning,
				this.#config.duration
			).toast()
		);
	}

	static error(message) {
		if (!this.#shouldToast(toastTypes.error)) {
			return;
		}

		DOM.get("#void-toast-container").append(
			new ToastInstance(
				message,
				toastTypes.error,
				this.#config.duration
			).toast()
		);
	}

	static critical(message) {
		DOM.get("#void-toast-container").append(
			new ToastInstance(message, toastTypes.error, 8).toast()
		);
	}

	static #shouldToast(type) {
		return (
			this.#settings.options.toasterEnabled.getValue() &&
			this.#config.toastLevel <= toastLevels[type]
		);
	}

	static renderSettings(settingsUi) {
		const container = DOM.create("div");

		container.append(DOM.create("h3", null, "Configure Toasts"));

		container.append(
			DOM.create(
				"p",
				null,
				"Toasts are notifications that pop up in the corner of your screen when things are happening."
			)
		);

		const options = Object.values(toastTypes).map((type) =>
			Option(type, this.#config.toastLevel === toastLevels[type], () => {
				this.#handleLevelChange(type);
				settingsUi.renderSettingsUiContent();
			})
		);
		container.append(Label("Toast level", Select(options)));

		const locationOptions = toastLocations.map((location) =>
			Option(location, this.#config.location === location, () => {
				this.#handleLocationChange(location);
				settingsUi.renderSettingsUiContent();
			})
		);

		container.append(Label("Toast location", Select(locationOptions)));

		const durationOptions = toastDurations.map((duration) =>
			Option(`${duration}s`, duration === this.#config.duration, () => {
				this.#handleDurationChange(duration);
				settingsUi.renderSettingsUiContent();
			})
		);

		container.append(Label("Toast duration", Select(durationOptions)));

		container.append(
			Button("Test Toasts", () => {
				Toaster.debug("This is a debug toast.");
				Toaster.success("This is a success toast.");
				Toaster.warning("This is a warning toast.");
				Toaster.error("This is an error toast.");
			})
		);

		return container;
	}

	static #handleLevelChange(type) {
		this.#config.toastLevel = toastLevels[type];
		this.#saveConfig();
	}

	static #handleLocationChange(location) {
		this.#config.location = location;
		this.#saveConfig();

		const container = DOM.get("#void-toast-container");
		for (const className of container.classList) {
			container.classList.remove(className);
		}
		container.classList.add(`void-${location}`);
	}

	static #handleDurationChange(duration) {
		this.#config.duration = duration;
		this.#saveConfig();
	}

	static #saveConfig() {
		localStorage.setItem(
			this.#configInLocalStorage,
			JSON.stringify(this.#config)
		);
	}
}
