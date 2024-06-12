// const {
// 	Toaster,
// 	ToasterConfig,
// 	toastLevels,
// 	toastTypes,
// } = require("../../src/utils/toaster");
// import { Settings } from "../../src/utils/settings";

it("skip", () => {});

// beforeAll(() => {
// 	jest.spyOn(global.Math, "random").mockReturnValue(0.12352);
// });

// afterAll(() => {
// 	jest.spyOn(global.Math, "random").mockRestore();
// });

// const renderSettingsUi = jest.fn();

// const toastCases = [
// 	[toastLevels.info, toastTypes.info, true],
// 	[toastLevels.info, toastTypes.success, true],
// 	[toastLevels.info, toastTypes.warning, true],
// 	[toastLevels.info, toastTypes.error, true],
// 	[toastLevels.success, toastTypes.info, false],
// 	[toastLevels.success, toastTypes.success, true],
// 	[toastLevels.success, toastTypes.warning, true],
// 	[toastLevels.success, toastTypes.error, true],
// 	[toastLevels.warning, toastTypes.info, false],
// 	[toastLevels.warning, toastTypes.success, false],
// 	[toastLevels.warning, toastTypes.warning, true],
// 	[toastLevels.warning, toastTypes.error, true],
// 	[toastLevels.error, toastTypes.info, false],
// 	[toastLevels.error, toastTypes.success, false],
// 	[toastLevels.error, toastTypes.warning, false],
// 	[toastLevels.error, toastTypes.error, true],
// ];

// describe("Toaster", () => {
// 	beforeEach(() => {
// 		document.body.replaceChildren();
// 	});

// 	test.each(toastCases)(
// 		"toast level %p should render %p message %p",
// 		(toastLevel, toastType, shouldRender) => {
// 			configureToaster(toastLevel);
// 			raiseToast(toastType, toastLevel);

// 			const toast = document.querySelector(".void-toast");
// 			if (shouldRender) {
// 				expect(toast).not.toBeNull();
// 			} else {
// 				expect(toast).toBeNull();
// 			}
// 		},
// 	);

// 	test.each(toastCases)(
// 		"toast level %p shouldn't render when toaster is disabled",
// 		(toastLevel, toastType) => {
// 			configureToaster(toastLevel, false);
// 			raiseToast(toastType, toastLevel);

// 			const toast = document.querySelector(".void-toast");
// 			expect(toast).toBeNull();
// 		},
// 	);

// 	it("renders critical error", () => {
// 		configureToaster(3, false);
// 		Toaster.critical("critical error");

// 		const toast = document.querySelector(".void-toast");
// 		expect(toast).not.toBeNull();
// 	});

// 	it("handles null config", () => {
// 		const settings = new Settings();
// 		settings.options.toasterEnabled.value = true;
// 		const toasterConfig = new ToasterConfig();
// 		localStorage.setItem(
// 			"void-verified-toaster-config",
// 			JSON.stringify(toasterConfig),
// 		);
// 		Toaster.initializeToaster(settings);

// 		Toaster.error("test");
// 		const toast = document.querySelector(".void-toast");
// 		expect(toast).not.toBeNull();
// 	});

// 	it("gets removed after a set amount of time", () => {
// 		jest.useFakeTimers();
// 		jest.spyOn(global, "setTimeout");
// 		configureToaster(2);
// 		Toaster.error("test");
// 		jest.runAllTimers();
// 		const toast = document.querySelector(".void-toast");
// 		expect(toast).toBeNull();
// 		jest.useRealTimers();
// 	});
// });

// describe("Toaster Settings", () => {
// 	it("renders settings", () => {
// 		configureToaster(0);
// 		const container = Toaster.renderSettings(renderSettingsUi);
// 		expect(container).toMatchSnapshot();
// 	});
// });

// const configureToaster = (toastLevel, enabled = true) => {
// 	const settings = new Settings();
// 	settings.options.toasterEnabled.value = enabled;
// 	const toasterConfig = new ToasterConfig({ toastLevel });
// 	localStorage.setItem(
// 		"void-verified-toaster-config",
// 		JSON.stringify(toasterConfig),
// 	);
// 	Toaster.initializeToaster(settings);
// };

// const raiseToast = (toastType, toastLevel) => {
// 	switch (toastType) {
// 		case toastTypes.info:
// 			Toaster.debug(`toastLevel ${toastLevel}`);
// 			break;
// 		case toastTypes.success:
// 			Toaster.success(`toastLevel ${toastLevel}`);
// 			break;
// 		case toastTypes.warning:
// 			Toaster.warning(`toastLevel ${toastLevel}`);
// 			break;
// 		case toastTypes.error:
// 			Toaster.error(`toastLevel ${toastLevel}`);
// 			break;
// 	}
// };
