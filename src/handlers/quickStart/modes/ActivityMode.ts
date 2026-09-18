import {ActivityFactory} from "../../../components/activity/ActivityFactory";
import {QuickStartHandler} from "../quickStartHandler";
import {DOM} from "../../../utils/DOM";
import {AnilistAPI} from "../../../api/anilistAPI";
import {Loader} from "../../../components/loader";

export class ActivityMode {
	static async openActivity(activityId: number){
		const container = this.renderLoader();
		const activity = await AnilistAPI.queryActivity(activityId, true);
		const activityComponent = ActivityFactory.createActivityComponent(activity);
		activityComponent.toggleReplies();
		container.replaceChildren(activityComponent.element);
	}

	static async tailReplies(activityId: number, numberOfReplies: number) {
		const container = this.renderLoader();
		const activity = await AnilistAPI.queryActivity(activityId, false);

		const perPage = 10;
		const page = Math.ceil(numberOfReplies / perPage);
		const replies = await AnilistAPI.queryActivityReplies(activityId, page, perPage);
		const activityComponent = ActivityFactory.createActivityComponent(activity);

		if (page > 1) {
			const skippedNotice = DOM.createDiv("reply-notice", `Skipped ${(page - 1) * perPage} replies.`);
			activityComponent.activityReplies.append(skippedNotice);
		}

		activityComponent.appendReplies(replies.replies, replies.pageInfo);
		activityComponent.setRepliesAsQueried();
		activityComponent.toggleReplies();
		container.replaceChildren(activityComponent.element);
	}

	private static renderLoader() {
		const container = DOM.createDiv(null, Loader());
		QuickStartHandler.openWithElement(container);
		return container;
	}
}
