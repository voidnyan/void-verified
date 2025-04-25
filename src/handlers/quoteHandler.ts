import {ClassWithTooltip, StaticTooltip} from "../utils/staticTooltip";
import {Debouncer} from "../utils/debouncer";
import {DOM} from "../utils/DOM";
import {ArrowTurnLeftIcon, CheckIcon, LinkIcon} from "../assets/icons";
import {DomDataHandler} from "./domDataHandler";
import {StaticSettings} from "../utils/staticSettings";
import {isNumber} from "node:util";

export const ScrollIntoViewOptions: ScrollIntoViewOptions = {
	behavior: "smooth",
	block: "start",
}

export class QuoteHandler extends ClassWithTooltip {
	private static debouncer = new Debouncer();

	static addSelectionListener() {
		this.initializeTooltip();
		this.handleQuoteSelection = this.handleQuoteSelection.bind(this);
		document.addEventListener("selectionchange", () => {
			if (!StaticSettings.options.replyToEnabled.getValue()) {
				return;
			}
			this.handleSelection();
		});
	}

	private static handleSelection() {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			this.hideTooltip();
			if (range.collapsed) {
				return;
			}

			this.debouncer.debounce(this.handleQuoteSelection, 100, selection, range);
		}
	}

	private static handleQuoteSelection(selection: Selection, range: Range) {
		const markdown = ((range.commonAncestorContainer.nodeType === 1
			? range.commonAncestorContainer
			: range.commonAncestorContainer.parentElement) as HTMLElement).closest(".markdown");

		if (!markdown) {
			return;
		}
		const rect = range.getBoundingClientRect();
		const quoteSelectionButton = DOM.create("div", "has-icon icon-mr", [ArrowTurnLeftIcon(), "Reply To"]);
		quoteSelectionButton.addEventListener("click", async (event) => {
			event.stopPropagation();
			const idElement = markdown.closest(".reply") ?? markdown.closest(".activity-entry");
			const activityElement = markdown.closest(".activity-entry");
			const id = DomDataHandler.getIdFromElement(idElement);
			const activityId = DomDataHandler.getIdFromElement(activityElement);

			const ref = idElement === activityElement ? id : `${activityId}/${id}`;
			await navigator.clipboard.writeText(`<blockquote href="${ref}">${selection.toString().trim()}</blockquote>`);
			this.replaceTooltipContent(DOM.create("div", "has-icon icon-mr", [CheckIcon(), "Copied to Clipboard"]), range.getBoundingClientRect());
			setTimeout(() => {
				this.hideTooltip();
			}, 800);
		});
		this.showTooltip(rect, quoteSelectionButton, true);
	}

	static addQuoteClickHandlers() {
		if (!StaticSettings.options.replyToEnabled.getValue()) {
			return;
		}

		const blockquotes = document.querySelectorAll("blockquote[href]:not(.void-quote)");
		for (const blockquote of blockquotes as NodeListOf<HTMLQuoteElement>) {
			let activityId, replyId;
			const ref = blockquote.getAttribute("href");
			const isReply = ref.includes("/");
			if (isReply) {
				[activityId, replyId] = ref.split("/");
			} else {
				activityId = ref;
			}

			if (!Number.isFinite(Number(activityId))) {
				continue;
			}

			if (isReply && (!Number.isFinite(Number(replyId)) || replyId === "")) {
				continue;
			}

			blockquote.classList.add("void-quote");

			const containingActivity: HTMLDivElement = blockquote.closest(".activity-entry");
			const containingActivityId = DomDataHandler.getIdFromElement(containingActivity);
			if (Number(activityId) === Number(containingActivityId)) {
				blockquote.addEventListener("click", () => {
					const navHeight = document.querySelector(".nav").getBoundingClientRect().height;
					if (isReply) {
						const quotedReply: HTMLDivElement = containingActivity.querySelector(`.reply[void-reply-id="${replyId}"]`);
						quotedReply.style.scrollMarginTop = (navHeight + 10) + "px";
						quotedReply.scrollIntoView(ScrollIntoViewOptions);
					} else {
						if (window.location.pathname.startsWith("/activity/")) {
							window.scrollTo({
								behavior: "smooth",
								top: 0
							});
						} else {
							containingActivity.style.scrollMarginTop = (navHeight + 10) + "px";
							containingActivity.scrollIntoView(ScrollIntoViewOptions);
						}
					}
				});
			} else {
				if (isReply) {
					StaticTooltip.register(blockquote, DOM.createAnchor(`/activity/${activityId}?void-reply-id=${replyId}`, "has-icon icon-mr", [
						LinkIcon(),
						"Direct Link"]), true);
				} else {
					StaticTooltip.register(blockquote, DOM.createAnchor(`/activity/${activityId}`, "has-icon icon-mr", [
						LinkIcon(),
						"Direct Link"]), true);
				}
			}
		}
	}

	static addDirectLinksToReplies() {
		if (!StaticSettings.options.replyDirectLinksEnabled.getValue()) {
			return;
		}

		const replies = document.querySelectorAll(".reply[void-reply-id]:not(:has(.void-reply-direct-link)):not(.preview)");
		for (const reply of replies) {
			const replyId = DomDataHandler.getIdFromElement(reply);
			const activity = reply.closest(".activity-entry");
			const activityId = DomDataHandler.getIdFromElement(activity);
			const anchor = DOM.createAnchor(`/activity/${activityId}?void-reply-id=${replyId}`, "has-icon reply-direct-link", LinkIcon());
			const actions = reply.querySelector(".actions");
			actions.insertBefore(anchor, actions.querySelector(".action.likes"));
		}
	}
}
