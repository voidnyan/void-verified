export class BaseConfig {
	configInLocalStorage: string;
	constructor(configInLocalStorage: string) {
		this.configInLocalStorage = configInLocalStorage;
	}
	save() {
		localStorage.setItem(this.configInLocalStorage, JSON.stringify(this));
	}

}
