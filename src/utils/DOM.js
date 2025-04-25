import {Vue} from "./vue";

export class DOM {
	static create(element, classes = null, children = null, options = {}) {
		const el = document.createElement(element);

		if (element.toLowerCase() === "a") {
			el.addEventListener("click", (event) => {
				Vue.handleAnchorClickEvent(event);
			})
		}

		if (classes !== null) {
			for (const className of classes?.split(" ")) {
				if (className.startsWith("#")) {
					el.setAttribute("id", `void-${className.slice(1)}`);
					continue;
				}
				if (className.startsWith(".")) {
					el.classList.add(className.slice(1));
					continue;
				}
				el.classList.add(`void-${className}`);
			}
		}

		if (children) {
			if (Array.isArray(children)) {
				el.append(...children);
			} else {
				el.append(children);
			}
		}

		for (const key of Object.keys(options)) {
			el[key] = options[key];
		}

		return el;
	}

	static createAnchor(href, classes = null, children = null) {
		const anchor = this.create("a", classes, children);
		anchor.setAttribute("href", href);
		return anchor;
	}

	static transformClasses(classes) {
		let result = [];
		for (const className of classes.split(" ")) {
			if (className.startsWith(".")) {
				result.push(className.slice(1));
				continue;
			}
			result.push(`void-${className}`);
		}
		return result;
	}

	static render(element, parent) {
		const htmlElement = document.createElement(element);
		parent.append(htmlElement);
	}

	static renderReplace(element, parent) {
		const htmlElement = document.createElement(element);
		htmlElement.setAttribute("title", "wow");
		parent.replaceChildren(htmlElement);
	}

	static getOrCreate(element, classes) {
		const id = classes
			.split(" ")
			.find((className) => className.startsWith("#"));
		return this.get(id) ?? this.create(element, classes);
	}

	static get(selector) {
		const convertedSelector = this.#convertSelector(selector);
		return document.querySelector(convertedSelector);
	}

	static getAll(selector) {
		const convertedSelector = this.#convertSelector(selector);
		return document.querySelectorAll(convertedSelector);
	}

	static #convertSelector(selector) {
		let results = [];
		for (const className of selector?.split(" ")) {
			if (className.startsWith("#")) {
				results.push(`#void-${className.slice(1)}`);
				continue;
			}
			results.push(`.void-${className}`);
		}
		return results.join(" ");
	}
}
