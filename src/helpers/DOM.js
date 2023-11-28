export class DOM {
	static create(element, classes = null, children = null) {
		const el = document.createElement(element);
		if (classes !== null) {
			for (const className of classes?.split(" ")) {
				if (className.startsWith("#")) {
					el.setAttribute("id", `void-${className.slice(1)}`);
					continue;
				}
				el.classList.add(`void-${className}`);
			}
		}

		if (children) {
			try {
				el.append(...children);
			} catch {
				el.append(children);
			}
		}

		return el;
	}

	static getOrCreate(element, classes) {
		const id = classes
			.split(" ")
			.find((className) => className.startsWith("#"));
		return this.get(id) ?? this.create(element, classes);
	}

	static get(selector) {
		return document.querySelector(selector);
	}

	static getAll(selector) {
		return document.querySelectorAll(selector);
	}
}
