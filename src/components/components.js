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

export const InputField = (value, onChange) => {
	const inputField = DOM.create("input", "input");
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
