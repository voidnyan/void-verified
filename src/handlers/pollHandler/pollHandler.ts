import {VoidApi} from "../../api/voidApi";
import {PollFormComponent} from "./pollFormComponent";
import {Toaster} from "../../utils/toaster";
import {PollComponent} from "./pollComponent";
import {StaticSettings} from "../../utils/staticSettings";

export class PollHandler {
	static addPollForms() {
		if (!StaticSettings.options.pollsEnabled.getValue()) {
			return;
		}
		const editors = document.querySelectorAll<HTMLDivElement>(".markdown-editor");
		for (const editor of editors) {
			if (editor.querySelector("div[title='Create Poll']")) {
				continue;
			}

			this.addPollForm(editor);
		}
	}

	static replacePollImages() {
		const pollImages = document.querySelectorAll<HTMLImageElement>(`img[src^="${VoidApi.url}/polls/poll-image/"]:not(img[void-poll-handling="true"])`);
		for (const pollImage of pollImages) {
			this.replacePollImage(pollImage);
		}
	}

	private static async replacePollImage(pollImage: HTMLImageElement) {
		if (!StaticSettings.options.pollsEnabled.getValue()) {
			return;
		}
		if (pollImage.closest(".preview")) {
			return;
		}

		pollImage.setAttribute("void-poll-handling", "true");
		try {
			const pollId = Number(pollImage.src.substring(`${VoidApi.url}/polls/poll-image/`.length));
			const poll = await VoidApi.getPoll(pollId);
			const pollComponent = new PollComponent(poll);
			const imageParent = pollImage.parentElement;
			if (imageParent.tagName.toLowerCase() === "a" && imageParent.getAttribute("href").startsWith(VoidApi.url.replace("/api", ""))) {
				imageParent.replaceWith(pollComponent.element);
			} else {
				pollImage.replaceWith(pollComponent.element);
			}
		} catch (error) {
			Toaster.error("Failed to get poll data.", error);
		}
	}

	private static addPollForm(editor: HTMLDivElement) {
		const pollForm = new PollFormComponent(editor);
		editor.append(pollForm.trigger);
		editor.insertAdjacentElement("afterend", pollForm.element);
	}
}
