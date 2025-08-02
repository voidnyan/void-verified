import {AnilistAPI} from "../api/anilistAPI";
import {Button} from "../components/components";
import {Toaster} from "../utils/toaster";
import {DOM} from "../utils/DOM";
import {StaticSettings} from "../utils/staticSettings";
import {ImageFormats} from "../assets/imageFormats";
import {Vue} from "../utils/vue";
import {StaticTooltip} from "../utils/staticTooltip";
import {Time} from "../utils/time";
import {CollapsedComments} from "../utils/collapsedReplies";
import {DomDataHandler} from "./domDataHandler";
import {AnilistAuth} from "../utils/anilistAuth";

export class ActivityHandler {
	static moveAndDisplaySubscribeButton() {
		if (!StaticSettings.options.moveSubscribeButtons.getValue()) {
			return;
		}

		const subscribeButtons = document.querySelectorAll<HTMLSpanElement>(
			"span[label='Unsubscribe'], span[label='Subscribe']",
		);
		for (const subscribeButton of subscribeButtons) {
			if ((subscribeButton.parentNode as HTMLDivElement).classList.contains("actions")) {
				continue;
			}

			const container = subscribeButton.parentNode.parentNode;
			const actions = container.querySelector(".actions");
			actions.append(subscribeButton);
		}
	}

	static addSelfMessageButton() {
		if (!StaticSettings.options.selfMessageEnabled.getValue()) {
			return;
		}

		if (
			!window.location.pathname.startsWith(
				`/user/${AnilistAuth.name}`,
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
					this.#handleSelfMessage();
				},
				"self-message",
			),
		);
	}

	static addCollapseReplyButtons() {
		if (!StaticSettings.options.collapsibleReplies.getValue()) {
			return;
		}

		const replies = document.querySelectorAll(".activity-replies .reply:not([collapsed]):not(.preview)");

		for (const reply of replies) {
			this.#addCollapseReplyButton(reply);
		}
	}

	static #addCollapseReplyButton(reply) {
		const button = DOM.create("div", "reply-collapse");
		const replyId = DomDataHandler.getIdFromElement(reply);
		button.addEventListener("click", () => {
			const isCollapsed = reply.getAttribute("collapsed") === "true";
			reply.setAttribute("collapsed", !isCollapsed);
			if (StaticSettings.options.rememberCollapsedReplies.getValue()) {
				CollapsedComments.setIsCollapsed(replyId, !isCollapsed);
			}
		});
		reply.prepend(button);
		const replyContent = DOM.create("div", "reply-content");
		replyContent.append(reply.querySelector(".header"), reply.querySelector(".reply-markdown"));
		reply.append(replyContent);
		let isCollapsed = false;
		if (StaticSettings.options.autoCollapseLiked.getValue()) {
			isCollapsed =  reply.querySelector(".action.likes .button").classList.contains("liked");
		}
		if (!isCollapsed && StaticSettings.options.autoCollapseSelf.getValue()) {
			isCollapsed = !reply.classList.contains("preview") && reply.querySelector("a.name").innerText.trim() === AnilistAuth.name || isCollapsed;
		}
		if (StaticSettings.options.rememberCollapsedReplies.getValue()) {
			const isManuallyCollapsed = CollapsedComments.isCollapsed(replyId);
			isCollapsed = isManuallyCollapsed !== undefined ? isManuallyCollapsed : isCollapsed;
		}
		reply.setAttribute("collapsed", isCollapsed);
	}

	static async #handleSelfMessage() {
		const message = document.querySelector<HTMLTextAreaElement>(
			".activity-feed-wrap > .activity-edit textarea",
		).value;
		try {
			Toaster.debug("Self-publishing a message.");
			const response = await AnilistAPI.selfMessage(message);
			Toaster.success("Message self-published.");
			if (Vue.router) {
				Vue.router.push(`/activity/${response.id}`);
			} else {
				window.location.replace(
					`https://anilist.co/activity/${response.id}`,
				);
			}
		} catch (error) {
			Toaster.error("There was an error self-publishing a message.", error);
		}
	}

	static removeBlankFromAnilistLinks() {
		if (!StaticSettings.options.removeAnilistBlanks.getValue()) {
			return;
		}

		const anilistLinks = document.querySelectorAll<HTMLAnchorElement>(
			"a:not(.void-link)[href^='https://anilist.co'][target='_blank']",
		);

		for (const link of anilistLinks) {
			link.removeAttribute("target");
			link.addEventListener("click", (event) => {
				const target = event.target as HTMLAnchorElement;
				event.preventDefault();
				const path = target.pathname + target.search;
				Vue.router.push(path);
			})
		}
	}

	static handleImageLinkPreview() {
		if (!StaticSettings.options.imagePreviewEnabled.getValue()) {
			return;
		}

		let imageContainer = document.querySelector<HTMLDivElement>(".void-image-preview-container");

		if (!imageContainer) {
			imageContainer = DOM.createDiv("image-preview-container");
			document.body.append(imageContainer);
		}


		const imageLinks = document.querySelectorAll<HTMLAnchorElement>(
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

	static #handleLinkHover(event) {
		let imageContainer = document.querySelector<HTMLDivElement>(".void-image-preview-container");
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

	static addTooltipsToTimestamps() {
		if (!StaticSettings.options.activityTimestampTooltipsEnabled.getValue()) {
			return;
		}

		const timestamps = document.querySelectorAll(".activity-entry:not(.void-activity-entry) time[title]");

		for (const timestamp of timestamps) {
			const dateString = timestamp.getAttribute("datetime");
			if (!dateString) {
				continue;
			}
			const time = Time.toLocaleString(new Date(dateString));
			StaticTooltip.register(timestamp, time);
			timestamp.removeAttribute("title");
		}
	}
}
