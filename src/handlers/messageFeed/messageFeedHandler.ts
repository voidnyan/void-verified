import {DOM} from "../../utils/DOM";
import {AnilistAPI} from "../../api/anilistAPI";
import {StaticSettings} from "../../utils/staticSettings";
import {Toaster} from "../../utils/toaster";
import {Loader} from "../../components/loader";
import {IMessageActivity} from "../../api/types/messageActivity";
import {TextActivityComponent} from "../../components/activity/textActivityComponent";
import {IListActivity} from "../../api/types/IListActivity";
import {ITextActivity} from "../../api/types/ITextActivity";

export class MessageFeedHandler {
	private static messageFeedContainer: HTMLDivElement;
	private static currentPage: number;
	static addFeedFilter() {
		if (window.location.pathname !== "/home" ||
			!StaticSettings.options.messageFeedEnabled.getValue() ||
			!StaticSettings.settingsInstance.isAuthorized()) {
			return;
		}

		const activityTypeSelection = document.querySelector(".feed-select .el-dropdown ul");

		if (!activityTypeSelection || activityTypeSelection.querySelector(".void-messages-feed-filter-option")) {
			return;
		}

		const messageFeedOption = DOM.create("li", "messages-feed-filter-option", "Messages");
		messageFeedOption.classList.add("el-dropdown-menu__item");

		for (const item of activityTypeSelection.children) {
			item.addEventListener("click", () => {
				item.classList.add("active");
				messageFeedOption.classList.remove("active");
				document.querySelector(".activity-feed-wrap").classList.remove("void-hide-activity-feed");
				document.querySelector(".void-message-feed")?.remove();
			});
		}

		const feedTypeToggle = document.querySelector(".feed-type-toggle");

		for (const item of feedTypeToggle.children) {
			item.addEventListener("click", () => {
				if (messageFeedOption.classList.contains("active")) {
					document.querySelector(".void-message-feed")?.remove();
					this.renderMessageFeed();
				}
			})
		}

		messageFeedOption.addEventListener("click", () => {
			activityTypeSelection.querySelector(".active")?.classList.remove("active");
			messageFeedOption.classList.add("active");
			this.renderMessageFeed();
		});

		activityTypeSelection.append(messageFeedOption);
	}

	private static async renderMessageFeed() {
		document.querySelector(".activity-feed-wrap").classList.add("void-hide-activity-feed")
		this.messageFeedContainer = DOM.create("div", ".activity-feed message-feed", Loader());
		document.querySelector(".activity-feed-wrap").append(this.messageFeedContainer);
		const anilistAPI = new AnilistAPI(StaticSettings.settingsInstance);
		let messages: IMessageActivity[];
		const isFollowing = document.querySelector(".feed-type-toggle :first-child").classList.contains("active");
		try {
			const data = await anilistAPI.queryMessages(isFollowing);
			messages = data.activities;
			this.currentPage = data.pageInfo.currentPage;
		} catch (error) {
			Toaster.error("Failed to query messages feed.", error);
			return;
		}
		this.messageFeedContainer.replaceChildren();
		this.appendMessages(messages);
	}

	private static appendMessages(messages: IMessageActivity[]) {
		for (const message of messages) {
			this.messageFeedContainer.append(new TextActivityComponent(message).element);
		}
		this.messageFeedContainer.append(this.createLoadMoreButton());
	}

	private static createLoadMoreButton() {
		const button = DOM.create("div", ".load-more", "Load More");
		button.addEventListener("click", async () => {
			const loader = Loader();
			button.replaceWith(loader);
			await this.loadMore();
			loader.remove();
		});
		return button;
	}
	private static async loadMore() {
		try {
			const isFollowing = document.querySelector(".feed-type-toggle :first-child").classList.contains("active");
			const anilistAPI = new AnilistAPI(StaticSettings.settingsInstance);
			const data = await anilistAPI.queryMessages(isFollowing, this.currentPage + 1);
			this.currentPage = data.pageInfo.currentPage;
			this.appendMessages(data.activities);
		} catch (error) {
			Toaster.error("There was an error querying activities.", error);
		}
	}

}
