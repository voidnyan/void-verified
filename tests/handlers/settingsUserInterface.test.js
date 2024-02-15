import { Settings } from "../../src/utils/settings";
import { SettingsUserInterface } from "../../src/handlers/settingsUserInterface";

describe("Settings User Interface", () => {
	it("renders", () => {
		const settings = new Settings();
		const styleHandler = jest.fn("../../src/handlers/styleHandler.js");
		const globalCSS = jest.fn("../../src/handlers/globalCSS.js");
		const userCSS = jest.fn("../../src/handlers/userCSS.js");
		const layoutDesigner = jest.fn("../../src/handlers/layoutDesigner.js");

		const settingsUserInterface = new SettingsUserInterface(
			settings,
			styleHandler,
			globalCSS,
			userCSS,
			layoutDesigner
		);

		const settingsContainer = document.createElement("div");
		settingsContainer.classList.add("settings");
		settingsContainer.classList.add("container");

		const content = document.createElement("div");
		content.classList.add("content");
		settingsContainer.append(content);

		document.body.append(settingsContainer);
		settingsUserInterface.renderSettingsUi();

		const settingsUserInterfaceDOM = document.querySelector(
			"#void-verified-settings"
		);

		expect(settingsUserInterfaceDOM).not.toBeNull();
	});
});
