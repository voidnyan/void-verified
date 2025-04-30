import {BaseConfig} from "./baseConfig";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {DOM} from "./DOM";
import {SelectComponent} from "../components/selectComponent";
import {Checkbox, Label} from "../components/components";


class TimeConfig extends BaseConfig {
	dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd" | "dd.mm.yyyy";
	use12HourFormat: boolean;

	constructor() {
		super(LocalStorageKeys.timeConfig);
		const config: TimeConfig = JSON.parse(localStorage.getItem(this.configInLocalStorage));
		this.dateFormat = config?.dateFormat ?? "mm/dd/yyyy";
		this.use12HourFormat = config?.use12HourFormat ?? true;
	}
}


export class Time {
	private static config = new TimeConfig();

	static convertToString(timestamp: number): string {
		const now = new Date();
		const seconds = Math.floor((now.getTime() - timestamp * 1000) / 1000);

		let interval = Math.floor(seconds / 31536000);
		if (interval > 1) {
			return interval + " years ago";
		} else if (interval === 1) {
			return "1 year ago";
		}

		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + " months ago";
		} else if (interval === 1) {
			return "1 month ago";
		}

		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + " days ago";
		} else if (interval === 1) {
			return "1 day ago";
		}

		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + " hours ago";
		} else if (interval === 1) {
			return "1 hour ago";
		}

		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + " minutes ago";
		} else if (interval === 1) {
			return "1 minute ago";
		}

		return Math.floor(seconds) + " seconds ago";
	}

	static convertToDate(timestamp: number | string | Date): Date {
		if (typeof timestamp === "number") {
			return new Date(timestamp * 1000);
		} else if (typeof timestamp === "string") {
			return new Date(timestamp);
		}
		return timestamp
	}

	static toLocaleString(date: Date | number | string) {
		let d = this.convertToDate(date);
		const day = d.getDate().toString().padStart(2, "0");
		const month = (d.getMonth() + 1).toString().padStart(2, "0");
		const year = d.getFullYear();
		const minute = d.getMinutes().toString().padStart(2, "0");
		const second = d.getSeconds().toString().padStart(2, "0");

		let formattedDate;
		switch (this.config.dateFormat) {
			case "dd/mm/yyyy":
				formattedDate = `${day}/${month}/${year}`;
				break;
			case "mm/dd/yyyy":
				formattedDate = `${month}/${day}/${year}`;
				break;
			case "dd.mm.yyyy":
				formattedDate = `${day}.${month}.${year}`;
				break;
			default:
				formattedDate = `${year}-${month}-${day}`;
		}

		let hour = d.getHours();
		let period = "";
		if (this.config.use12HourFormat) {
			period = hour >= 12 ? "PM" : "AM";
			hour = hour % 12 || 12;
		}

		const hourStr = hour.toString().padStart(2, "0");

		const formattedTime = `${hourStr}:${minute}:${second}${this.config.use12HourFormat ? " " + period : ""}`;

		return `${formattedDate} ${formattedTime}`;
	}

	static toAnilistTimestamp(date: Date | string) {
		let d = typeof date === "string" ? new Date(date) : date;
		return Math.floor(d.getTime() / 1000);
	}

	static renderConfig() {
		const container = DOM.createDiv(null, DOM.create("h3", null, "Time Format Configuration"));
		const dateFormatSelect = new SelectComponent(
			this.config.dateFormat,
			["yyyy-mm-dd", "dd/mm/yyyy", "mm/dd/yyyy", "dd.mm.yyyy"],
			(value: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd" | "dd.mm.yyyy") => {
				this.config.dateFormat = value;
				this.config.save();
			});

		const use12HourFormatCheckbox = Checkbox(this.config.use12HourFormat, (event) => {
			this.config.use12HourFormat = event.target.checked;
			this.config.save();
		})

		container.append(
			Label("Date format", dateFormatSelect.element),
			Label("Use 12 hour format", use12HourFormatCheckbox));

		return container;
	}
}
