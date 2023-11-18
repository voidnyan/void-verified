export class ActivityHandler {
	settings;
	constructor(settings) {
		this.settings = settings;
	}

	moveAndDisplaySubscribeButton() {
		if (
			!this.settings.getOptionValue(
				this.settings.Options.moveSubscribeButtons
			)
		) {
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
}
