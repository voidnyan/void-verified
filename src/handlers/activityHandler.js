import { DOM } from "../helpers/DOM";

export class ActivityHandler {
	settings;
	constructor(settings) {
		this.settings = settings;
	}

	moveAndDisplaySubscribeButton() {
		if (!this.settings.options.moveSubscribeButtons.getValue()) {
			return;
		}

		const subscribeButtons = document.querySelectorAll(
			"span[label='Unsubscribe'], span[label='Subscribe']"
		);
		for (const subscribeButton of subscribeButtons) {
			if (subscribeButton.parentNode.classList.contains("actions")) {
				continue;
			}

			const container = subscribeButton.parentNode.parentNode;
			const actions = container.querySelector(".actions");
			actions.append(subscribeButton);
		}
	}

	removeBlankFromAnilistLinks() {
		if (!this.settings.options.removeAnilistBlanks.getValue()) {
			return;
		}

		const anilistLinks = DOM.getAll(
			"a[href^='https://anilist.co'][target='_blank']"
		);

		for (const link of anilistLinks) {
			link.removeAttribute("target");
		}
	}
}
