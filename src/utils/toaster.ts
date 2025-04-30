import {DOM} from "./DOM";
import {Select, Toast, Option, Button, Label} from "../components/components";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {AnilistAPIError} from "../api/anilistAPI";
import {SelectComponent} from "../components/selectComponent";

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
	error: Error;
	// durationLeft;
	// interval;
	constructor(message, type, duration, error?: Error) {
		this.type = type;
		this.message = message;
		this.duration = duration * 1000;
		this.error = error;
	}

	toast() {
		const toast = Toast(this.message, this.type);

		if (this.error && this.error instanceof AnilistAPIError) {
			toast.append(` (${this.error.errors[0].message})`);
		}

		// this.durationLeft = this.duration;
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
	static #configInLocalStorage = LocalStorageKeys.toasterConfig;
	static #settings;

	static initializeToaster(settings) {
		this.#settings = settings;
		const config = JSON.parse(
			localStorage.getItem(this.#configInLocalStorage),
		);
		this.#config = new ToasterConfig(config);
		const toastContainer = DOM.create(
			"div",
			`#toast-container ${this.#config.location}`,
		);
		document.body.append(toastContainer);
	}

	static debug(message) {
		if (!this.#shouldToast(toastTypes.info)) {
			return;
		}
		DOM.get("#toast-container").append(
			new ToastInstance(
				message,
				toastTypes.info,
				this.#config.duration,
			).toast(),
		);
	}

	static success(message) {
		if (!this.#shouldToast(toastTypes.success)) {
			return;
		}

		DOM.get("#toast-container").append(
			new ToastInstance(
				message,
				toastTypes.success,
				this.#config.duration,
			).toast(),
		);
	}

	static warning(message) {
		if (!this.#shouldToast(toastTypes.warning)) {
			return;
		}

		DOM.get("#toast-container").append(
			new ToastInstance(
				message,
				toastTypes.warning,
				this.#config.duration,
			).toast(),
		);
	}

	static error(message: string, error?: Error) {
		if (!this.#shouldToast(toastTypes.error)) {
			return;
		}

		DOM.get("#toast-container").append(
			new ToastInstance(
				message,
				toastTypes.error,
				this.#config.duration,
				error
			).toast(),
		);
	}

	static critical(message) {
		DOM.get("#toast-container").append(
			new ToastInstance(message, toastTypes.error, 8).toast(),
		);
	}

	static notify(message) {
		DOM.get("#toast-container").append(
			new ToastInstance(message, toastTypes.info, this.#config.duration).toast(),
		);
	}

	static #shouldToast(type) {
		return (
			this.#settings.options.toasterEnabled.getValue() &&
			this.#config.toastLevel <= toastLevels[type]
		);
	}

	static renderSettings() {
		const container = DOM.createDiv();

		container.append(DOM.create("h3", null, "Configure Toasts"));

		container.append(
			DOM.create(
				"p",
				null,
				"Toasts are notifications that pop up in the corner of your screen when things are happening.",
			),
		);

		const toastTypeSelect = new SelectComponent(this.#config.toastLevel, Object.values(toastTypes), (value) => {
			this.#handleLevelChange(value);
		} );

		container.append(Label("Toast level", toastTypeSelect.element));

		const locationSelect = new SelectComponent(this.#config.location, toastLocations, (value) => {
			this.#handleLocationChange(location);
		})

		container.append(Label("Toast location", locationSelect.element));

		const durationSelect = new SelectComponent(this.#config.duration, toastDurations, (value) => {
			this.#handleDurationChange(value);
		})

		container.append(Label("Toast duration", durationSelect.element));

		container.append(
			Button("Test Toasts", () => {
				Toaster.debug("This is a debug toast.");
				Toaster.success("This is a success toast.");
				Toaster.warning("This is a warning toast.");
				Toaster.error("This is an error toast.");
			}),
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

		const container = DOM.get("#toast-container");
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
			JSON.stringify(this.#config),
		);
	}
}
