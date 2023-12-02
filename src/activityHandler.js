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

			if (this.settings.options.autoLikeOnSubscribe.getValue()) {
				this.#enableAutoLike(subscribeButton);
			}
		}
	}

	#enableAutoLike(subscribeButton) {
		subscribeButton.addEventListener("click", () => {
			this.#likeActivity(subscribeButton);
		});
	}

	#likeActivity(subscribeButton) {
		if (subscribeButton.getAttribute("label") === "Unsubscribe") {
			return;
		}
		const likeButton =
			subscribeButton.parentNode.children[1].children[0].children[1];
		console.log(likeButton);
		if (!likeButton.classList.contains("liked")) {
			if (likeButton.fireEvent) {
				likeButton.fireEvent("onclick");
			} else {
				const evt = document.createEvent("Events");
				evt.initEvent("onClick", true);
				likeButton.dispatchEvent(new Event("click"));
			}
			console.log("triggered");
		}
	}
}
