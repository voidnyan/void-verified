import {ActivityFactory} from "../../../components/activity/ActivityFactory";
import {QuickStartHandler} from "../quickStartHandler";
import {DOM} from "../../../utils/DOM";
import {AnilistAPI} from "../../../api/anilistAPI";
import {Loader} from "../../../components/loader";

export class ActivityMode {
	static async openActivity(activityId: number){
		const container = DOM.createDiv(null, Loader());
		QuickStartHandler.openWithElement(container);
		const activity = await AnilistAPI.queryActivity(activityId, true);
		const activityComponent = ActivityFactory.createActivityComponent(activity);
		activityComponent.toggleReplies();
		container.replaceChildren(activityComponent.element);
	}
}
