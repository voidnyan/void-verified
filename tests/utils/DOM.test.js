import { DOM } from "../../src/utils/DOM";

describe("create", () => {
	it("creates an element", () => {
		const elem = DOM.create("div");
		expect(elem).toMatchSnapshot();
	});

	it("creates an element with an id", () => {
		const elem = DOM.create("div", "#test");
		expect(elem).toMatchSnapshot();
	});

	it("creates an element with a class", () => {
		const elem = DOM.create("div", "test");
		expect(elem).toMatchSnapshot();
	});

	it("creates an element with an id and multiple classes", () => {
		const elem = DOM.create("div", "#test test test2");
		expect(elem).toMatchSnapshot();
	});

	it("creates an element with a child element", () => {
		const childElement = DOM.create("div", "child");
		const elem = DOM.create("div", "parent", childElement);
		expect(elem).toMatchSnapshot();
	});

	it("creates an element with an array of children", () => {
		const children = [1, 2, 3, 4, 5].map((val) => {
			return DOM.create("div", "child", val);
		});
		const elem = DOM.create("div", "parent", children);
		expect(elem).toMatchSnapshot();
	});
});

describe("Getters", () => {
	it("getOrCreate creates a new element", () => {
		const element = DOM.getOrCreate("div", "#test");
		expect(element).toMatchSnapshot();
	});

	it("getOrCreate gets existing element", () => {
		const existingElement = DOM.create(
			"div",
			"#test",
			"this exists in the body",
		);
		document.body.append(existingElement);
		const element = DOM.getOrCreate("div", "#test");
		expect(element).toMatchSnapshot();
	});

	it("getAll gets all elements", () => {
		const existingElems = [1, 2, 3, 4, 5].map((val) => {
			return DOM.create("div", "test", val);
		});
		document.body.append(...existingElems);
		const elems = DOM.getAll("test");
		expect(elems).toMatchSnapshot();
	});
});
