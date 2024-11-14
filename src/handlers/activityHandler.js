import {AnilistAPI} from "../api/anilistAPI";
import {Button} from "../components/components";
import {Toaster} from "../utils/toaster";
import {DOM} from "../utils/DOM";
import {StaticSettings} from "../utils/staticSettings";
import {ImageFormats} from "../assets/imageFormats";

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
			"span[label='Unsubscribe'], span[label='Subscribe']",
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
				`/user/${this.settings.anilistUser}`,
			)
		) {
			return;
		}

		const activityEditActions = document.querySelector(
			".activity-feed-wrap > .activity-edit > .actions",
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
				"self-message",
			),
		);
	}

	addCollapseReplyButtons() {
		if (!this.settings.options.collapsibleReplies.getValue()) {
			return;
		}

		const replies = document.querySelectorAll(".activity-replies .reply:not([collapsed])");

		for (const reply of replies) {
			this.#addCollapseReplyButton(reply);
		}
	}

	#addCollapseReplyButton(reply) {
		const button = DOM.create("div", "reply-collapse");
		button.addEventListener("click", () => {
			const isCollapsed = reply.getAttribute("collapsed") === "true";
			reply.setAttribute("collapsed", !isCollapsed);
		});
		reply.prepend(button);
		const replyContent = DOM.create("div", "reply-content");
		replyContent.append(reply.querySelector(".header"), reply.querySelector(".reply-markdown"));
		reply.append(replyContent);
		let isLiked = false;
		switch (true) {
			case this.settings.options.autoCollapseLiked.getValue():
				isLiked =  reply.querySelector(".action.likes .button").classList.contains("liked");
			case this.settings.options.autoCollapseSelf.getValue():
				isLiked = !reply.classList.contains("preview") && reply.querySelector("a.name").innerText.trim() === this.settings.anilistUser || isLiked;
		}
		reply.setAttribute("collapsed", isLiked);
	}

	async #handleSelfMessage(settings) {
		const anilistAPI = new AnilistAPI(settings);
		const message = document.querySelector(
			".activity-feed-wrap > .activity-edit textarea",
		).value;
		try {
			Toaster.debug("Self-publishing a message.");
			const response = await anilistAPI.selfMessage(message);
			Toaster.success("Message self-published.");
			window.location.replace(
				`https://anilist.co/activity/${response.id}`,
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
			"a:not(.void-link)[href^='https://anilist.co'][target='_blank']",
		);

		for (const link of anilistLinks) {
			link.removeAttribute("target");
		}
	}

	handleImageLinkPreview() {
		if (!StaticSettings.options.imagePreviewEnabled.getValue()) {
			return;
		}

		let imageContainer = document.querySelector(".void-image-preview-container");

		if (!imageContainer) {
			imageContainer = DOM.create("div", "image-preview-container");
			document.body.append(imageContainer);
		}


		const imageLinks = document.querySelectorAll(
			ImageFormats.map(format => `.markdown a:not([void-link-preview])[href$='.${format}' i]:not(:has(img))`).join()
		)

		for (const link of imageLinks) {
			link.setAttribute("void-link-preview", "true");
			link.addEventListener("mouseover", (event) => {this.#handleLinkHover(event);});
			link.addEventListener("mouseout", () => {
				imageContainer.style.display = "none";
			})
		}
	}

	#handleLinkHover(event) {
		let imageContainer = document.querySelector(".void-image-preview-container");
		imageContainer.replaceChildren();
		const href = event.target.getAttribute("href");
		const image = DOM.create("img");
		image.setAttribute("src", href);
		image.setAttribute("loading", "lazy");
		imageContainer.append(image);
		imageContainer.style.display = "block";
		const position = event.clientY < window.innerHeight / 2 ? `${event.clientY + 20}px` : `${event.clientY - image.clientHeight - 20}px`;
		imageContainer.style.top = position;
	}
}
