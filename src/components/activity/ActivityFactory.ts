import {IListActivity} from "../../api/types/IListActivity";
import {ITextActivity} from "../../api/types/ITextActivity";
import {ListActivityComponent} from "./listActivityComponent";
import {TextActivityComponent} from "./textActivityComponent";
import {IMessageActivity} from "../../api/types/messageActivity";

export class ActivityFactory {
	static createActivityComponent(activity: IListActivity | ITextActivity | IMessageActivity) {
		switch (activity.type) {
			case "ANIME_LIST":
			case "MANGA_LIST":
				return new ListActivityComponent(activity as IListActivity);
			case "TEXT":
			case "MESSAGE":
				return new TextActivityComponent(activity as ITextActivity | IMessageActivity)
		}
	}
}
