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

export const Button = (text, onClick) => {
	const button = DOM.create("button", "button", text);
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

const transformClasses = (base, additional) => {
	let classes = base;
	if (additional) {
		classes += ` ${additional}`;
	}
	return classes;
};