import { Checkbox, Modal, Note, SettingLabel } from "../components/components";
import { changeLog } from "../assets/changeLog";
import { DOM } from "./DOM";

export class ChangeLog {
	#lastVersion;
	#settings;
	#lastVersionInLocalStorage = "void-verified-changelog-last-version";

	constructor(settings) {
		this.#settings = settings;
		this.#lastVersion = localStorage.getItem(
			this.#lastVersionInLocalStorage,
		);
	}

	renderChangeLog(forceDisplay = false) {
		if (
			!this.#settings.options.changeLogEnabled.getValue() &&
			!forceDisplay
		) {
			return;
		}

		if (!this.#newVersionExists() && !forceDisplay) {
			return;
		}

		const modalBody = [
			DOM.create(
				"div",
				"change-log-note",
				Note(
					"Here are some changes included in recent releases. You can enable new features here or later from settings. You can view this popup again or disable it from settings.",
				),
			),
		];
		modalBody.push(
			...changeLog.map((version) => {
				return this.#createModalContent(version);
			}),
		);

		document.body.append(
			Modal(modalBody, () => {
				this.#handleClose(this);
			}),
		);
	}

	#newVersionExists() {
		if (!this.#lastVersion) {
			return true;
		}
		const versions = changeLog.map((version) =>
			version.versionNumber.split("."),
		);
		const [lastMajorVersion, lastMinorVersion] =
			this.#lastVersion.split(".");

		for (const [majorVersion, minorVersion] of versions) {
			if (
				Number(majorVersion) > Number(lastMajorVersion) ||
				Number(minorVersion) > Number(lastMinorVersion)
			) {
				return true;
			}
		}

		return false;
	}

	#createModalContent(version) {
		const container = DOM.create("div");
		const header = DOM.create(
			"h3",
			"change-log-header",
			`Version ${version.versionNumber}`,
		);
		container.append(header);
		const list = DOM.create("ul", "change-log-list");
		const listItems = version.featureList.map((feature) => {
			return this.#createFeatureListItem(feature);
		});
		list.append(...listItems);
		container.append(list);
		return container;
	}

	#createFeatureListItem(feature) {
		const container = DOM.create("li");
		if (feature.option) {
			const value = this.#settings.options[feature.option].getValue();
			container.append(
				SettingLabel(
					feature.description,
					Checkbox(value, (event) => {
						this.#handleOptionChange(event, feature.option);
					}),
				),
			);
			return container;
		}
		container.append(
			DOM.create("span", "change-log-list-item", [
				DOM.create("span", null, "-"),
				DOM.create("span", null, feature.description),
			]),
		);
		return container;
	}

	#handleOptionChange(event, option) {
		const value = event.target.checked;
		this.#settings.saveSettingToLocalStorage(option, value);
	}

	#handleClose(_changeLog) {
		const version = changeLog[0].versionNumber;
		_changeLog.#lastVersion = version;
		localStorage.setItem(_changeLog.#lastVersionInLocalStorage, version);
	}
}
