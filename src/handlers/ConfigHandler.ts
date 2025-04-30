import {LocalStorageKeys} from "../../src/assets/localStorageKeys";
import {Toaster} from "../utils/toaster";
import {DOM} from "../utils/DOM";
import {Button, Checkbox, SettingLabel} from "../components/components";

const ignoredKeys = [
	LocalStorageKeys.miniProfileCache,
	LocalStorageKeys.notificationRelationsCache,
	LocalStorageKeys.notificationDeadLinkRelationsCache,
	LocalStorageKeys.readNotifications,
	LocalStorageKeys.collapsedContainers
]

export class ConfigHandler {
	static renderSettings() {
		const container = DOM.createDiv();
		container.append(DOM.create("h4", null, "Import"));
		container.append(this.createInput());

		container.append(this.createExportSection());

		return container;
	}

	private static createInput() {
		const input = DOM.create("input", "file-input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", ".json");
		input.addEventListener("change", (event) => {
			this.import((event.target as HTMLInputElement).files[0]);
		});
		return DOM.create("div", "dropbox", [input, DOM.create("p", null, "Drop VoidVerified config json file here or click to upload")]);
	}

	private static createExportSection() {
		const container = DOM.create("div");
		container.append(DOM.create("h4", null, "Export"));

		let exportedItems = Object.values(LocalStorageKeys)
			.filter(x => !ignoredKeys.includes(x))
			.map(x => {
				return {exported: true, value: x}
			});

		for (const {exported, value} of exportedItems) {
			const item = SettingLabel(value, Checkbox(exported, (event) => {
				exportedItems = exportedItems.map(x => x.value === value ? {...x, exported: event.target.checked} : x);
			}));
			container.append(item);
		}

		const exportButton = Button("Export", () => {
			console.log(exportedItems);
			console.log(Object.entries(LocalStorageKeys));
			this.export(Object.entries(LocalStorageKeys)
				.filter(([_, value]) =>
					exportedItems.find(x => x.value === value)?.exported
				));
		});
		container.append(exportButton);

		return container;
	}

	static export(items: [string, string][]) {
		const voidVerifiedConfigs = {};

		for (const [key, value] of items.filter(([_, value]) => !ignoredKeys.includes(value))) {
			let item = localStorage.getItem(value);
			try {
				item = JSON.parse(item);
			} catch (error) {
				//
			}
			if (item) {
				voidVerifiedConfigs[key] = item;
			}
		}

		const configsAsString = JSON.stringify(voidVerifiedConfigs);

		const blob = new Blob([configsAsString], {type: "application/json"});
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = "VoidVerified_configs";
		link.href = url;
		link.click();
		window.URL.revokeObjectURL(url);
	}

	static import(file: File) {
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const configs = JSON.parse(e.target.result as string);
				for (const [key, value] of Object.entries(configs)) {
					console.log(key, value);
					if (typeof value !== "string") {
						localStorage.setItem(LocalStorageKeys[key], JSON.stringify(value));
					} else {
						localStorage.setItem(LocalStorageKeys[key], value);
					}

				}
				Toaster.success("Config successfully imported.")
				window.location.reload();
			} catch (error) {
				console.error(error);
				Toaster.error("There was an error reading the file.");
			}
		}

		reader.readAsText(file);
	}
}
