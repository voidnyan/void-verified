import {CacheTimes} from "../assets/cacheTimes";
import {Toaster} from "./toaster";

class ExponentialBackOffData {
	currentLevel = 0;
	currentFailures = 0;
	lastFailureAt: Date | null = null;
	disabledUntil: Date | null = null;
	clearLevelAfter: Date | null = null;

	private readonly localStorageKey: string;

	constructor(localStorageKey: string) {
		this.localStorageKey = localStorageKey;
		const data: ExponentialBackOffData = JSON.parse(localStorage.getItem(localStorageKey));

		this.currentLevel = data?.currentLevel ?? 0;
		this.currentFailures = data?.currentFailures ?? 0;
		this.lastFailureAt = data?.lastFailureAt ? new Date(data.lastFailureAt) : null;
		this.disabledUntil = data?.disabledUntil ? new Date(data.disabledUntil) : null;
		this.clearLevelAfter = data?.clearLevelAfter ? new Date(data.clearLevelAfter) : null;
	}

	save(){
		localStorage.setItem(this.localStorageKey, JSON.stringify(this));
	}
}

export class ExponentialBackoffError extends Error {}

export class ExponentialBackoff {
	private failuresPerLevel = 3;
	private failureWindow = 120 * 1000;

	private backOffTimes = [
		0,
		CacheTimes.minute,
		5 * CacheTimes.minute,
		30 * CacheTimes.minute,
		CacheTimes.hour,
		6 * CacheTimes.hour,
	];

	private readonly localStorageKey: string;

	constructor(localStorageKey: string) {
		this.localStorageKey = localStorageKey;
	}

	throwIfDisabled(){
		if (this.isDisabled()) {
			throw new ExponentialBackoffError();
		}
	}

	isDisabled(): boolean {
		this.clearLevel();
		const data = this.getData();
		if (data.disabledUntil === null) {
			return false;
		}

		const currentTime = new Date();
		if (currentTime >= data.disabledUntil) {
			data.disabledUntil = null;
			data.currentFailures = 0;
			currentTime.setMilliseconds(currentTime.getMilliseconds() + CacheTimes.hour);
			data.clearLevelAfter = currentTime;
			data.save();
			return false;
		}

		return true;
	}

	handleExponentialBackOff() {
		this.increaseLevel();
	}

	private increaseLevel() {
		const data = this.getData();
		const currentTime = new Date();
		if (data.lastFailureAt !== null && currentTime.getTime() - data.lastFailureAt.getTime() > this.failureWindow) {
			data.currentFailures = 0;
		}

		data.currentFailures++;
		data.lastFailureAt = currentTime;

		if (data.currentFailures < this.failuresPerLevel) {
			data.save();
			return;
		}

		data.currentFailures = 0;
		data.currentLevel++;

		if (data.currentLevel >= this.backOffTimes.length) {
			data.currentLevel = this.backOffTimes.length - 1;
		}

		Toaster.warning(`Increased exponential backoff level to ${data.currentLevel}`);

		const disabledUntil = new Date();
		disabledUntil.setMilliseconds(disabledUntil.getMilliseconds() + this.backOffTimes[data.currentLevel]);
		data.disabledUntil = disabledUntil;
		data.save();
	}

	private clearLevel() {
		const data = this.getData();
		const currentDate = new Date();
		if (data.clearLevelAfter === null || data.clearLevelAfter > currentDate) {
			return;
		}

		data.clearLevelAfter = null;
		data.currentLevel = 0;
		data.currentFailures = 0;
		data.disabledUntil = null;
		data.lastFailureAt = null;
		data.save();
	}

	private getData(): ExponentialBackOffData {
		return new ExponentialBackOffData(this.localStorageKey);
	}
}
