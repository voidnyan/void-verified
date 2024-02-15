import * as icons from "../../src/assets/icons";

describe("Icons", () => {
	test.each(Object.entries(icons))("%p matches snapshot", (_, icon) => {
		expect(icon()).toMatchSnapshot();
	});
});
