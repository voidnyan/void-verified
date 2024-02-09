import { DOM } from "../helpers/DOM";

export const ColorPicker = (value, onChange) => {
	const container = DOM.create("div", "color-picker-container");
	const colorPicker = DOM.create("input", "color-picker");
	colorPicker.setAttribute("type", "color");
	colorPicker.value = value;
	colorPicker.addEventListener("change", (event) => {
		onChange(event);
	});

	const inputField = DOM.create("input", "color-picker-input");
	inputField.value = value;
	inputField.addEventListener("change", (event) => {
		onChange(event);
	});

	container.append(colorPicker, inputField);
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

const transformClasses = (base, additional) => {
	let classes = base;
	if (additional) {
		classes += ` ${additional}`;
	}
	return classes;
};
