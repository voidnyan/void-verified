import { DOM } from "../utils/DOM";
import {ArrowUpTrayIcon} from "../assets/icons";

export class FileInputIconComponent {
	element: HTMLDivElement;
	input: HTMLInputElement;

	constructor(onFileInput: (event: Event) => void, accept?: string) {
		this.element = DOM.create("div", "file-icon-input-dropbox");
		this.input = DOM.create("input");
		this.input.setAttribute("type", "file");
		if (accept) {
			this.input.setAttribute("accept", accept);
		}
		this.input.addEventListener("change", onFileInput);
		this.input.removeAttribute("title");
		this.element.append(this.input, ArrowUpTrayIcon());

		this.element.addEventListener("click", () => {
			this.input.click();
		})
	}
}
