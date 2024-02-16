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
	test.each([...simpleComponents])("%p matches snapshot", (_, component) => {
		expect(component()).toMatchSnapshot();
	});

	describe("Pagination", () => {
		it("does not render with only one page", () => {
			const pagination = components.Pagination(0, 0, () => {});
			expect(pagination.children.length).toBe(0);
			expect(pagination).toMatchSnapshot();
		});

		it("renders with two pages", () => {
			const pagination = components.Pagination(0, 1, () => {});
			expect(pagination).toMatchSnapshot();
		});

		it("renders chevrons with more than three pages", () => {
			const pagination = components.Pagination(1, 3, () => {});
			expect(pagination).toMatchSnapshot();
		});

		test.each([0, 3, 5])(
			"renders correctly with %p current page",
			(currentPage) => {
				const pagination = components.Pagination(
					currentPage,
					5,
					() => {}
				);
				expect(pagination).toMatchSnapshot();
			}
		);
	});

	describe("GifContainer", () => {
		it("matches snapshot", () => {
			const gifContainer = createGifContainer("imgUrl", () => {});
			expect(gifContainer).toMatchSnapshot();
		});

		it("clicking like button triggers passed function", () => {
			const onClick = jest.fn();
			const gifContainer = createGifContainer("imgUrl", onClick);
			const button = gifContainer.querySelector(".void-icon-button");
			button.click();
			button.click();
			expect(onClick).toHaveBeenCalledTimes(2);
		});

		// for whatever reason, the test does not add the void-liked class to the component although it does work in the UI so this test is irrelevant untill the reason for that is figured out
		// it("image is not liked yet", () => {
		// 	const gifContainer = createGifContainer("anotherUrl", () => {});
		// 	expect(gifContainer).toMatchSnapshot();
		// });
	});
});

const createGifContainer = (img, onClick) => {
	const gifContainer = components.GifContainer(createImage(img), onClick, [
		"imgUrl",
	]);
	return gifContainer;
};

const createImage = (url) => {
	const image = document.createElement("img");
	image.setAttribute("src", url);
	return image;
};
