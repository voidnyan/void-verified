import {Vue} from "../utils/vue";
import {ScrollIntoViewOptions} from "./quoteHandler";
import {StaticSettings} from "../utils/staticSettings";

export class DomDataHandler {
	private static scrolledReplyId: number;
	static addReplyIdsToDom() {
		const replies = document.querySelectorAll(".reply:not(.reply[void-reply-id])");
		for (const reply of replies) {
			const id = Vue.getProps(reply)?.id;
			reply.setAttribute("void-reply-id", id);
		}
	}

	static addActivityIdsToDom() {
		const activities = document.querySelectorAll(".activity-entry:not(.activity-entry[void-activity-id])");
		for (const activity of activities) {
			const id = Vue.getProps(activity)?.id;
			activity.setAttribute("void-activity-id", id);
		}
	}

	static getIdFromElement(element: Element): number {
		if (!element) {
			return undefined
		}
		return Number(element.getAttribute("void-reply-id") ?? element.getAttribute("void-activity-id") ?? Vue.getProps(element)?.id);
	}

	static scrollToReply() {
		if (!StaticSettings.options.scrollToReplyEnabled.getValue()) {
			return;
		}

		const urlSearchParams = new URLSearchParams(window.location.search);
		const replyId = Number(urlSearchParams.get("void-reply-id"));
		if (!replyId) {
			this.scrolledReplyId = null
			return;
		}

		if (this.scrolledReplyId === replyId) {
			return;
		}

		this.scrolledReplyId = replyId;
		let scrolled = false;
		let intervalId = setInterval(() => {
			if (scrolled) {
				clearInterval(intervalId);
				return;
			}
			const reply = document.querySelector(`.reply[void-reply-id="${replyId}"]`);
			if (!reply) {
				return;
			}
			reply.scrollIntoView(ScrollIntoViewOptions);
			scrolled = true;
		}, 25);
	}
}
