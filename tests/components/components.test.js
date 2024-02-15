import * as components from "../../src/components/components";

beforeAll(() => {
	jest.spyOn(global.Math, "random").mockReturnValue(0.12352);
});

afterAll(() => {
	jest.spyOn(global.Math, "random").mockRestore();
});

const componentBlackList = [
	"GifContainer",
	"GifItem",
	"Label",
	"Select",
	"SettingLabel",
];

const simpleComponents = Object.entries(components)
	.map(([name, component]) => {
		return { name, component };
	})
	.filter((component) => !componentBlackList.includes(component.name))
	.map((component) => {
		return [component.name, component.component];
	});

describe("Components", () => {
	test.each([...simpleComponents])(
		"%p matches snapshot",
		(ree, component) => {
			expect(component()).toMatchSnapshot();
		}
	);
});
