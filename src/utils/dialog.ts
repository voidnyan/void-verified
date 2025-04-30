import {DOM} from "./DOM";
import {Button, InputField} from "../components/components";
import {ALScrollock} from "./ALScrollock";
import {XMarkIcon} from "../assets/icons";

export class Dialog {
	private static dialogWrapper: HTMLDivElement;
	private static dialog: HTMLDivElement;
	private static header: HTMLDivElement;
	private static content: HTMLDivElement;
	private static confirmCallback: () => void;
	static initialize() {
		this.dialogWrapper = DOM.create("div", "dialog-wrapper");
		this.dialog = DOM.create("div", "dialog");

		this.header = DOM.create("div", "dialog-header");
		const closeIcon = XMarkIcon();
		closeIcon.addEventListener("click", () => {
			this.close();
		});
		this.dialog.append(DOM.create("div", "dialog-header-wrap", [this.header, closeIcon]));

		this.content = DOM.create("div", "dialog-content");
		this.dialog.append(this.content);

		const actions = DOM.create("div", "dialog-actions");
		const cancelButton = Button("Cancel", () => {
			this.close();
		},"error slim");
		const confirmButton = Button("Ok", () => {
			this.confirmCallback();
			this.close();
		}, "slim");
		actions.append(cancelButton, confirmButton);
		this.dialog.append(actions);

		this.dialogWrapper.append(this.dialog);
		document.body.append(this.dialogWrapper);
	}

	static confirm(confirmCallback: () => void, content: string = "Are you sure you want to do this?", title: string = "Warning") {
		if (!this.dialogWrapper) {
			this.initialize();
		}
		this.confirmCallback = confirmCallback;
		this.header.replaceChildren(title);
		this.content.replaceChildren(content);
		this.open();
	}

	static prompt(callback: (value: string) => void, title = "Insert Value", placeholder?: string) {
		if (!this.dialogWrapper) {
			this.initialize()
		}

		this.header.replaceChildren(title);
		const input = InputField("", () => {}, "w-100", {placeholder});
		this.content.replaceChildren(input);
		this.confirmCallback = () => {
			callback(input.value);
		};
		this.open();
	}

	static open() {
		ALScrollock.lock();
		this.dialogWrapper.classList.add("void-visible");
	}

	static close() {
		ALScrollock.unlock();
		this.dialogWrapper.classList.remove("void-visible");
	}

	static isOpen() {
		return this.dialogWrapper?.classList.contains("void-visible");
	}
}
