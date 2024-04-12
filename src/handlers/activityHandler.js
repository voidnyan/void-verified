import { AnilistAPI } from "../api/anilistAPI";
import { GifIcon } from "../assets/icons";
import { Button, IconButton } from "../components/components";
import { DOM } from "../utils/DOM";
import { Toaster } from "../utils/toaster";

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

	addSelfMessageButton() {
		if (!this.settings.options.selfMessageEnabled.getValue()) {
			return;
		}

		if (
			!window.location.pathname.startsWith(
				`/user/${this.settings.anilistUser}`
			)
		) {
			return;
		}

		const activityEditActions = document.querySelector(
			".activity-feed-wrap > .activity-edit > .actions"
		);
		if (
			!activityEditActions ||
			activityEditActions?.querySelector(".void-self-message")
		) {
			return;
		}

		activityEditActions.append(
			Button(
				"Message Self",
				() => {
					this.#handleSelfMessage(this.settings);
				},
				"self-message"
			)
		);
	}

	async #handleSelfMessage(settings) {
		const anilistAPI = new AnilistAPI(settings);
		const message = document.querySelector(
			".activity-feed-wrap > .activity-edit textarea"
		).value;
		try {
			Toaster.debug("Self-publishing a message.");
			const response = await anilistAPI.selfMessage(message);
			Toaster.success("Message self-published.");
			window.location.replace(
				`https://anilist.co/activity/${response.id}`
			);
		} catch (err) {
			console.error(err);
			Toaster.error("There was an error self-publishing a message.");
		}
	}

	removeBlankFromAnilistLinks() {
		if (!this.settings.options.removeAnilistBlanks.getValue()) {
			return;
		}

		const anilistLinks = document.querySelectorAll(
			"a:not(.void-link)[href^='https://anilist.co'][target='_blank']"
		);

		for (const link of anilistLinks) {
			link.removeAttribute("target");
		}
	}
}
