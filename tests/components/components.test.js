import { HeartIcon } from "../../src/assets/icons";
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
	"Tooltip",
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
	describe("SimpleComponentTests", () => {
		test.each([...simpleComponents])(
			"%p matches snapshot",
			(_, component) => {
				expect(component()).toMatchSnapshot();
			},
		);
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

		it("clicking triggers callback", () => {
			const onClick = jest.fn();
			const pagination = components.Pagination(1, 3, onClick);
			const button = pagination.querySelector(
				".void-icon-button:nth-child(3)",
			);
			const chevronLeft = pagination.querySelector(
				".void-icon-button:nth-child(1)",
			);
			const chevronRight = pagination.querySelector(
				".void-icon-button:nth-child(5)",
			);
			chevronLeft.click();
			chevronRight.click();
			button.click();
			expect(onClick).toBeCalledTimes(3);
		});

		test.each([0, 3, 5])(
			"renders correctly with %p current page",
			(currentPage) => {
				const pagination = components.Pagination(
					currentPage,
					5,
					() => {},
				);
				expect(pagination).toMatchSnapshot();
			},
		);
	});

	describe("GifContainer", () => {
		it("matches snapshot", () => {
			const gifContainer = createGifContainer(
				"http://localhost/imgUrl",
				() => {},
			);
			expect(gifContainer).toMatchSnapshot();
		});

		it("clicking like button triggers passed function", () => {
			const onClick = jest.fn();
			const gifContainer = createGifContainer(
				"http://localhost/imgUrl",
				onClick,
			);
			const button = gifContainer.querySelector(".void-icon-button");
			button.click();
			button.click();
			expect(onClick).toHaveBeenCalledTimes(2);
		});

		it("image is not liked yet", () => {
			const gifContainer = createGifContainer(
				"http://localhost/anotherUrl",
				() => {},
			);
			expect(gifContainer).toMatchSnapshot();
		});
	});

	describe("GifItem", () => {
		it("matches snapshot", () => {
			const gifItem = components.GifItem(
				"http://localhost/imgUrl",
				() => {},
				() => {},
				["http://localhost/imgUrl"],
			);
			expect(gifItem).toMatchSnapshot();
		});
		it("onClick function is called", () => {
			const onClick = jest.fn();
			const gifItem = components.GifItem(
				"http://localhost/imgUrl",
				onClick,
				() => {},
				["http://localhost/imgUrl"],
			);
			gifItem.click();
			expect(onClick).toBeCalledTimes(1);
		});
	});

	describe("Checkbox", () => {
		it("is disabled", () => {
			const checkbox = components.Checkbox(false, () => {}, true);
			expect(checkbox.disabled).toBeTruthy();
		});
	});

	describe("Label", () => {
		it("matches snapshot", () => {
			const input = components.InputField("inputfield", () => {});
			const label = components.Label("label text", input);
			expect(label).toMatchSnapshot();
		});
	});

	describe("Select", () => {
		it("matches snapshot", () => {
			const options = ["option1", "option2", "option3"].map((option) => {
				return components.Option(option, option === "option2");
			});
			const select = components.Select(options);
			expect(select).toMatchSnapshot();
		});

		it("clicking an option triggers callback", () => {
			const onClick = jest.fn();
			const options = ["option1", "option2", "option3"].map((option) => {
				return components.Option(option, option === "option2", onClick);
			});
			components.Select(options);
			options[1].click();
			expect(onClick).toHaveBeenCalledTimes(1);
		});
	});

	describe("Textarea", () => {
		it("onchange triggers callback", () => {
			const onChange = jest.fn();
			const textarea = components.TextArea("test", onChange);
			textarea.dispatchEvent(new Event("change"));
			expect(onChange).toHaveBeenCalledTimes(1);
		});
	});

	describe("Button", () => {
		it("click triggers callback", () => {
			const onClick = jest.fn();
			const button = components.Button("button", onClick);
			button.click();
			expect(onClick).toHaveBeenCalledTimes(1);
		});
	});

	describe("ActionInputField", () => {
		it("renders icon", () => {
			const actionInputField = components.ActionInputField(
				"value",
				() => {},
				HeartIcon(),
			);
			expect(actionInputField).toMatchSnapshot();
		});

		it("clicking icon triggers callback", () => {
			const onClick = jest.fn();
			const actionInputField = components.ActionInputField(
				"value",
				onClick,
				HeartIcon(),
			);
			actionInputField.querySelector(".void-icon-button").click();
			expect(onClick).toHaveBeenCalledTimes(1);
		});
	});

	describe("SecretField", () => {
		it("clicking button switches type to text", () => {
			const secretField = components.SecretField("value", () => {});
			const hideButton = secretField.querySelector(".void-icon-button");
			hideButton.click();
			expect(secretField).toMatchSnapshot();
			expect(secretField.querySelector("input").type).toBe("text");
		});

		it("clicking button twice switches type back to password", () => {
			const secretField = components.SecretField("value", () => {});
			const hideButton = secretField.querySelector(".void-icon-button");
			hideButton.click();
			hideButton.click();
			expect(secretField).toMatchSnapshot();
			expect(secretField.querySelector("input").type).toBe("password");
		});
	});

	describe("InputField", () => {
		it("change triggers callback", () => {
			const onChange = jest.fn();
			const inputField = components.InputField("value", onChange);
			inputField.dispatchEvent(new Event("change"));
			expect(onChange).toHaveBeenCalledTimes(1);
		});
	});

	describe("ColorPicker", () => {
		it("text field change triggers callback", () => {
			const onChange = jest.fn();
			const colorPicker = components.ColorPicker("#fffff", onChange);
			colorPicker
				.querySelector("input[type='text']")
				.dispatchEvent(new Event("change"));
			expect(onChange).toBeCalledTimes(1);
		});

		it("color input change triggers callback", () => {
			const onChange = jest.fn();
			const colorPicker = components.ColorPicker("#fffff", onChange);
			colorPicker
				.querySelector("input[type='color']")
				.dispatchEvent(new Event("change"));
			expect(onChange).toBeCalledTimes(1);
		});
	});

	describe("SettingLabel", () => {
		it("matches snapshot", () => {
			const settingLabel = components.SettingLabel(
				"settinglabel",
				components.Checkbox(true, () => {}),
			);
			expect(settingLabel).toMatchSnapshot();
		});
	});

	describe("RangeField", () => {
		it("change triggers callback", () => {
			const onChange = jest.fn();
			const rangeField = components.RangeField(50, onChange, 500);
			const rangeInput = rangeField.querySelector("input");

			rangeInput.value = 100;
			rangeInput.dispatchEvent(new Event("change"));
			rangeInput.dispatchEvent(new Event("input"));
			const display = rangeField.querySelector(".void-range-display");
			expect(onChange).toBeCalledTimes(1);
			expect(display.textContent).toBe("100");
		});
	});
});

const createGifContainer = (img, onClick) => {
	const gifContainer = components.GifContainer(createImage(img), onClick, [
		"http://localhost/imgUrl",
	]);
	return gifContainer;
};

const createImage = (url) => {
	const image = document.createElement("img");
	image.setAttribute("src", url);
	return image;
};
