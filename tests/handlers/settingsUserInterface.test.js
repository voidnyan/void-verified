import { Settings } from "../../src/utils/settings";
import { SettingsUserInterface } from "../../src/handlers/settingsUserInterface";
import { StyleHandler } from "../../src/handlers/styleHandler";
import { GlobalCSS } from "../../src/handlers/globalCSS";
import { UserCSS } from "../../src/handlers/userCSS";
import { LayoutDesigner } from "../../src/handlers/layoutDesigner";

beforeAll(() => {
	jest.spyOn(global.Math, "random").mockReturnValue(0.12352);
});

afterAll(() => {
	jest.spyOn(global.Math, "random").mockRestore();
});

describe("Settings User Interface", () => {
	it("renders", () => {
		const settings = new Settings();
		const styleHandler = new StyleHandler(settings);
		const globalCSS = new GlobalCSS(settings);
		const userCSS = new UserCSS(settings);
		const layoutDesigner = new LayoutDesigner(settings);

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
		expect(settingsUserInterfaceDOM).toMatchSnapshot();
	});
});
