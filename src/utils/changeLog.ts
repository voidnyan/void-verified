import { Checkbox, Modal, Note, SettingLabel } from "../components/components";
import {changeLog, Feature, Version} from "../assets/changeLog";
import { DOM } from "./DOM";
import {StaticSettings} from "./staticSettings";

export class ChangeLog {
	static #lastVersion = localStorage.getItem("void-verified-changelog-last-version");
	static #lastVersionInLocalStorage = "void-verified-changelog-last-version";

	static renderChangeLog(forceDisplay = false) {
		if (
			!StaticSettings.settingsInstance.options.changeLogEnabled.getValue() &&
			!forceDisplay
		) {
			return;
		}

		if (!this.newVersionExists() && !forceDisplay) {
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
			...changeLog().map((version) => {
				return this.createModalContent(version);
			}),
		);

		document.body.append(
			Modal(modalBody, () => {
				this.handleClose(this);
			}),
		);
	}

	private static newVersionExists() {
		if (!this.#lastVersion) {
			return true;
		}
		const versions = changeLog().map((version) =>
			version.versionNumber.split("."),
		);
		const [lastMajorVersion, lastMinorVersion] =
			this.#lastVersion.split(".");

		// This is a loop for some reason? 2024 voidnyan really did some messed up stuff
		for (const [majorVersion, minorVersion] of versions) {
			if (
				Number(majorVersion) > Number(lastMajorVersion) ||
				(Number(majorVersion) === Number(lastMajorVersion) &&
					Number(minorVersion) > Number(lastMinorVersion))
			) {
				return true;
			}
		}

		return false;
	}

	private static createModalContent(version: Version) {
		const container = DOM.create("div");
		const header = DOM.create(
			"h3",
			"change-log-header",
			`Version ${version.versionNumber}`,
		);
		container.append(header);
		const list = DOM.create("ul", "change-log-list");
		const listItems = version.featureList.map((feature) => {
			return this.createFeatureListItem(feature);
		});
		list.append(...listItems);
		container.append(list);
		return container;
	}

	private static createFeatureListItem(feature: Feature) {
		const container = DOM.create("li");
		if (feature.option) {
			console.log(feature.option);
			const value = feature.option.getValue() as boolean;
			container.append(
				SettingLabel(
					feature.option.description,
					Checkbox(value, (event) => {
						feature.option.setValue(event.target.checked);
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

	private static handleClose(_changeLog) {
		const version = changeLog[0].versionNumber;
		_changeLog.#lastVersion = version;
		localStorage.setItem(_changeLog.#lastVersionInLocalStorage, version);
	}
}
