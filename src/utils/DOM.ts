import {Vue} from "./vue";

export class DOM {
	static create<T extends HTMLElement = HTMLElement>(element: string, classes?: string, children?: any, options = {}) : T {
		const el = document.createElement(element) as T;

		if (element.toLowerCase() === "a") {
			el.addEventListener("click", (event) => {
				Vue.handleAnchorClickEvent(event);
			})
		}

		this.transformClasses(el, classes);

		if (children) {
			if (Array.isArray(children)) {
				// @ts-ignore
				el.append(...children);
			} else {
				// @ts-ignore
				el.append(children);
			}
		}

		for (const key of Object.keys(options)) {
			el[key] = options[key];
		}

		return el;
	}

	static createAnchor(href, classes = null, children = null): HTMLAnchorElement {
		const anchor = this.create<HTMLAnchorElement>("a", classes, children);
		anchor.setAttribute("href", href);
		return anchor;
	}

	static createDiv(classes?: string, children?: any): HTMLDivElement {
		return DOM.create<HTMLDivElement>("div", classes, children);
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

	static transformClasses(element: HTMLElement, classes?: string) {
		if (classes) {
			for (const className of classes?.split(" ")) {
				if (className.startsWith("#")) {
					element.setAttribute("id", `void-${className.slice(1)}`);
					continue;
				}
				if (className.startsWith(".")) {
					element.classList.add(className.slice(1));
					continue;
				}
				element.classList.add(`void-${className}`);
			}
		}
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
