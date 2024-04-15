import { StyleHandler } from "./styleHandler";

export class AnilistFeedFixHandler {
	#hidePrivateMessages = false;
	#settings;
	#styleHandler;
	constructor(settings) {
		this.#settings = settings;
		this.#styleHandler = new StyleHandler(settings);
	}

	handleFilters() {
		if (
			!this.#settings.options.hideMessagesFromListFeed.getValue() ||
			window.location.pathname !== `/user/${this.#settings.anilistUser}/`
		) {
			return;
		}

		const feedOptions = Array.from(
			document.querySelector(".activity-feed-wrap .section-header ul")
				.children,
		);

		if (!feedOptions) {
			return;
		}

		if (feedOptions[3].getAttribute("void-fixed")) {
			return;
		}

		for (const option of feedOptions.slice(0, 3)) {
			option.addEventListener("click", () => {
				this.#hidePrivateMessages = false;
			});
		}

		feedOptions[3].addEventListener("click", () => {
			this.#hidePrivateMessages = true;
		});
		feedOptions[3].setAttribute("void-fixed", true);
	}

	handleFix() {
		if (
			window.location.pathname !== `/user/${this.#settings.anilistUser}/`
		) {
			this.#styleHandler.clearStyles("private-message-fix");
			this.#hidePrivateMessages = false;
			return;
		}

		if (this.#hidePrivateMessages) {
			this.#styleHandler.createStyleLink(
				hidePrivateMessagesStyle,
				"private-message-fix",
			);
		} else {
			this.#styleHandler.clearStyles("private-message-fix");
		}
	}
}

const hidePrivateMessagesStyle = `
    .activity-feed-wrap .activity-message {
        display: none !important;
    }
`;
