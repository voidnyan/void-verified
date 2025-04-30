import {DOM} from "../../utils/DOM";
import {IListActivity} from "../../api/types/IListActivity";
import {BaseActivityComponent} from "./baseActivityComponent";
import {StaticSettings} from "../../utils/staticSettings";
import {EllipsisHorizontalIcon} from "../../assets/icons";
import {DropdownMenuComponent, IDropdownMenuOption} from "../dropdownComponent";

export class ListActivityComponent extends BaseActivityComponent{
	element: HTMLDivElement;
	activity: IListActivity;
	constructor(activity: IListActivity) {
		super(activity.id);
		this.activity = activity;
		const entryClass = activity.type === "ANIME_LIST" ? ".activity-anime_list" : ".activity-manga_list";
		this.element = DOM.create("div", `activity-entry .activity-entry ${entryClass}`);
		this.element.setAttribute("void-activity-id", activity.id.toString());

		const wrap = DOM.create("div", ".wrap");
		wrap.append(this.createList());
		const time = this.createTime(activity.createdAt);
		const dropdownTrigger = DOM.create("div", "action .action activity-dropdown-trigger", EllipsisHorizontalIcon());
		time.prepend(this.createSubscribeButton(activity), dropdownTrigger);

		const directLink = this.createDirectLink(activity)
		const dropdownItems: IDropdownMenuOption[] = [{item: directLink, value: "directlink"}];


		if (activity.user.id === StaticSettings.settingsInstance.userId) {
			const deleteButton = this.createDeleteButton("ACTIVITY", activity.id, () => {
				this.element.remove();
			})
			dropdownItems.push({
				item: deleteButton,
				value: "delete"
			});
		}

		new DropdownMenuComponent(dropdownItems, dropdownTrigger, (_) => {});

		wrap.append(time);

		const actions = this.createActions(activity);
		wrap.append(actions);
		this.element.append(wrap);

		const replyWrap = this.createReplyWrap();
		if (activity.replies) {
			this.activityReplies.replaceChildren();
			this.appendReplies(activity.replies);
			actions.querySelector(".action.replies")?.setAttribute("queried", "true");
		}
		this.element.append(replyWrap);
		this.element.append(this.editContainer);
	}

	private createList(): HTMLDivElement {
		const list = DOM.createDiv(".list");
		const cover = DOM.create("a", ".cover");
		cover.setAttribute("style", `background-image: url("${this.activity.media.coverImage.large}");`);
		cover.setAttribute("href", `/${this.activity.type.toLocaleLowerCase()}/${this.activity.media.id}`);

		const details = DOM.create("div", ".details");

		const {name, avatar, donatorBadge} = this.createHeaderUser(this.activity.user);
		details.append(name);
		if (donatorBadge) {
			details.append(donatorBadge);
		}

		const status = this.createStatus();
		details.append(status);
		details.append(avatar);

		list.append(cover, details);
		return list;
	}

	private createStatus(): HTMLDivElement {
		const status = DOM.createDiv(".status", this.getProgress());
		const title = DOM.create("a", ".title", this.activity.media.title.userPreferred);
		title.setAttribute("href", `/${this.activity.type.toLocaleLowerCase()}/${this.activity.media.id}`);
		status.append(title);
		return status;
	}

	private getProgress() {
		const status = this.activity.status.charAt(0).toUpperCase() + this.activity.status.slice(1);
		if (status.includes("episode")) {
			return `${status} ${this.activity.progress} of `;
		} else if (status.includes("chapter")) {
			return `${status} ${this.activity.progress} of `;
		} else {
			return status + " ";
		}
	}
}
