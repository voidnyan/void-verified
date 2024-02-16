import {
	DoubleChevronLeftIcon,
	DoubleChevronRightIcon,
	EyeClosedIcon,
	EyeIcon,
	HeartIcon,
} from "../assets/icons";
import { DOM } from "../helpers/DOM";

export const ColorPicker = (value, onChange) => {
	const container = DOM.create("div", "color-picker-container");
	const colorPicker = DOM.create("input", "color-picker");
	colorPicker.setAttribute("type", "color");
	colorPicker.value = value;
	colorPicker.addEventListener("change", (event) => {
		onChange(event);
	});

	container.append(colorPicker);
	const inputField = DOM.create("input", "color-picker-input");
	inputField.value = value ?? "#";
	inputField.addEventListener("change", (event) => {
		onChange(event);
	});
	container.append(inputField);
	return container;
};

export const InputField = (value, onChange, classes) => {
	const inputField = DOM.create("input", transformClasses("input", classes));
	inputField.value = value;
	inputField.addEventListener("change", (event) => {
		onChange(event);
	});
	return inputField;
};

export const SecretField = (value, onChange) => {
	const secret = InputField(value, onChange);
	secret.setAttribute("type", "password");
	const eyeIcon = EyeIcon();
	const closedEyeIcon = EyeClosedIcon();

	const container = DOM.create("div", "action-container", secret);
	const iconButton = IconButton(eyeIcon, (event) => {
		if (event.target.firstChild === eyeIcon) {
			event.target.replaceChildren(closedEyeIcon);
			secret.setAttribute("type", "text");
			return;
		}
		event.target.replaceChildren(eyeIcon);
		secret.setAttribute("type", "password");
	});
	container.append(iconButton);
	return container;
};

export const ActionInputField = (value, onClick, icon) => {
	const inputField = InputField(value, () => {});

	const container = DOM.create("div", "action-container", inputField);
	const iconButton = IconButton(icon, (event) => {
		onClick(event, inputField);
	});
	container.append(iconButton);
	return container;
};

export const RangeField = (value, onChange, max, step = 1, min = 0, unit) => {
	const container = DOM.create("div", "range-container");
	const range = DOM.create("input", "range");
	const display = DOM.create("div", "range-display", `${value}${unit ?? ""}`);
	range.setAttribute("type", "range");
	range.addEventListener("change", (event) => {
		onChange(event);
	});
	range.addEventListener("input", (event) => {
		display.replaceChildren(`${event.target.value}${unit ?? ""}`);
	});
	range.setAttribute("max", max);
	range.setAttribute("min", min);
	range.setAttribute("step", step);
	range.setAttribute("value", value);
	container.append(range, display);
	return container;
};

export const Button = (text, onClick) => {
	const button = DOM.create("button", "button", text);
	button.addEventListener("click", (event) => {
		onClick(event);
	});
	return button;
};

export const IconButton = (text, onClick, classes) => {
	const button = DOM.create(
		"div",
		transformClasses("icon-button", classes),
		text
	);
	button.addEventListener("click", (event) => {
		onClick(event);
	});
	return button;
};

export const Note = (text) => {
	const note = DOM.create("div", "notice", text);
	return note;
};

export const Link = (text, href, target = "_blank", classes) => {
	const link = DOM.create("a", transformClasses("link", classes), text);
	link.setAttribute("href", href);
	link.setAttribute("target", target);
	return link;
};

export const TextArea = (text, onChange, classes) => {
	const textArea = DOM.create(
		"textarea",
		transformClasses("textarea", classes),
		text
	);
	textArea.addEventListener("change", (event) => {
		onChange(event);
	});

	return textArea;
};

export const Toast = (message, type) => {
	const toast = DOM.create("div", transformClasses("toast", type), message);
	return toast;
};

export const Select = (options) => {
	const container = DOM.create("div", "select");
	for (const option of options) {
		container.append(option);
	}
	return container;
};

export const Option = (value, selected, onClick) => {
	const option = DOM.create("div", "option", value);
	if (selected) {
		option.classList.add("active");
	}
	option.addEventListener("click", onClick);
	return option;
};

export const Label = (text, element) => {
	const container = DOM.create("div", "label-container");
	const label = DOM.create("label", "label-span", text);
	const id = Math.random();
	label.setAttribute("for", id);
	element.setAttribute("id", id);
	container.append(label, element);
	return container;
};

export const Table = (head, body) => {
	const table = DOM.create("table", "table", [head, body]);
	return table;
};

export const TableHead = (...headers) => {
	const headerCells = headers.map((header) => DOM.create("th", null, header));
	const headerRow = DOM.create("tr", null, headerCells);
	const head = DOM.create("thead", null, headerRow);
	return head;
};

export const TableBody = (rows) => {
	const tableBody = DOM.create("tbody", null, rows);
	return tableBody;
};

export const Checkbox = (checked, onChange, title, disabled = false) => {
	const checkbox = DOM.create("input", "checkbox");
	checkbox.setAttribute("type", "checkbox");
	checkbox.checked = checked;

	if (disabled) {
		checkbox.setAttribute("disabled", "");
	}

	checkbox.addEventListener("change", onChange);
	checkbox.title = title;
	return checkbox;
};

export const SettingLabel = (text, input) => {
	const container = DOM.create("div", "setting-label-container", input);
	const label = DOM.create("label", "setting-label", text);
	const id = Math.random();
	label.setAttribute("for", id);
	input.setAttribute("id", id);
	container.append(label);
	return container;
};

export const GifKeyboard = (header) => {
	const container = DOM.create("div", "gif-keyboard-container");
	container.append(header);
	const gifList = DOM.create("div", "gif-keyboard-list");
	const controls = DOM.create("div", "gif-keyboard-control-container");
	container.append(
		DOM.create("div", "gif-keyboard-list-container", [controls, gifList])
	);

	return container;
};

export const GifItem = (url, onClick, onLike, gifs) => {
	const container = DOM.create("div", "gif-keyboard-item");
	container.addEventListener("click", () => {
		onClick();
	});
	const img = DOM.create("img");
	img.setAttribute("src", url);
	container.append(GifContainer(img, onLike, gifs));
	return container;
};

export const GifContainer = (imgElement, onLike, gifs) => {
	const container = DOM.create("div", "gif-like-container");
	container.append(
		imgElement,
		IconButton(
			HeartIcon(),
			(event) => {
				event.stopPropagation();
				event.preventDefault();
				onLike(event);
				if (event.target.classList.contains("void-liked")) {
					event.target.classList.remove("void-liked");
				} else {
					event.target.classList.add("void-liked");
				}
			},
			`gif-like ${gifs.includes(imgElement.src) && "liked"}`
		)
	);
	return container;
};

export const Pagination = (currentPage, maxPage, onClick) => {
	const container = DOM.create("div", "pagination-container");

	if (maxPage < 1) {
		return container;
	}

	let displayedPages = [];
	if (maxPage >= 3) {
		container.append(
			IconButton(
				DoubleChevronLeftIcon(),
				() => {
					onClick(0);
				},
				`pagination-skip ${currentPage === 0 && "active"}`
			)
		);
		if (currentPage >= maxPage - 1) {
			displayedPages.push(maxPage - 2, maxPage - 1, maxPage);
		} else if (currentPage === 0) {
			displayedPages.push(currentPage, currentPage + 1, currentPage + 2);
		} else {
			displayedPages.push(currentPage - 1, currentPage, currentPage + 1);
		}
	} else {
		for (let i = 0; i <= maxPage; i++) {
			displayedPages.push(i);
		}
	}

	for (const page of displayedPages) {
		container.append(
			IconButton(
				page + 1,
				() => {
					onClick(page);
				},
				currentPage === page && "active"
			)
		);
	}

	if (maxPage >= 3) {
		container.append(
			IconButton(
				DoubleChevronRightIcon(),
				() => {
					onClick(maxPage);
				},
				`pagination-skip ${currentPage === maxPage && "active"}`
			)
		);
	}

	return container;
};

const transformClasses = (base, additional) => {
	let classes = base;
	if (additional) {
		classes += ` ${additional}`;
	}
	return classes;
};
