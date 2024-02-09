import { DOM } from "../helpers/DOM";
import { Select, Toast, Option, Note } from "../components/components";

const toastTypes = {
	info: "info",
	success: "success",
	danger: "danger",
};

const toastLevels = {
	info: 0,
	success: 1,
	danger: 2,
};

class ToasterConfig {
	toastLevel;
	duration;
	constructor(config) {
		this.toastLevel = config?.toastLevel ?? 1;
		this.duration = config?.duration ?? 5;
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
		const toastContainer = DOM.create("div", "#toast-container");
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

	static error(message) {
		if (!this.#shouldToast(toastTypes.danger)) {
			return;
		}

		DOM.get("#void-toast-container").append(
			new ToastInstance(
				message,
				toastTypes.danger,
				this.#config.duration
			).toast()
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

		container.append(DOM.create("h3", null, "Toaster Configuration"));

		container.append(
			DOM.create(
				"p",
				null,
				"Toasts are notifications that pop up in the corner of your screen when things are happening. Info-level is only recommended for debugging."
			)
		);

		container.append(DOM.create("span", null, "Toast level: "));

		const options = Object.values(toastTypes).map((type) =>
			Option(type, this.#config.toastLevel === toastLevels[type], () => {
				this.#config.toastLevel = toastLevels[type];
				localStorage.setItem(
					this.#configInLocalStorage,
					JSON.stringify(this.#config)
				);
				settingsUi.renderSettingsUi();
			})
		);
		container.append(Select(options));

		return container;
	}
}
