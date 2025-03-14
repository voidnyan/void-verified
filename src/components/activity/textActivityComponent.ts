import {BaseActivityComponent} from "./baseActivityComponent";
import {IMessageActivity} from "../../api/types/messageActivity";
import {DOM} from "../../utils/DOM";
import {ArrowLongRightIcon, EllipsisHorizontalIcon} from "../../assets/icons";
import {Markdown} from "../../utils/markdown";
import {ITextActivity} from "../../api/types/ITextActivity";
import {StaticSettings} from "../../utils/staticSettings";
import {DropdownMenuComponent} from "../dropdownComponent";

export class TextActivityComponent extends BaseActivityComponent {
	element: HTMLDivElement;
	markdown: HTMLDivElement;

	constructor(activity: IMessageActivity | ITextActivity) {
		super(activity.id);
		const activityClass = activity.type === "MESSAGE" ? ".activity-message" : ".activity-text";
		this.element = DOM.create("div", `activity-entry .activity-entry ${activityClass}`);
		const wrap = DOM.create("div", ".wrap");
		const text = this.createText(activity);

		const time = this.createTime(activity.createdAt);
		const directLink = this.createDirectLink(activity);
		const subscribeButton = this.createSubscribeButton(activity);
		const dropdownTrigger = DOM.create("div", "action .action activity-dropdown-trigger", EllipsisHorizontalIcon());

		const dropdownItems = [{item: directLink, value: "directlink"}];
		const message = activity as IMessageActivity;
		const textActivity = activity as ITextActivity;

		if (message.messenger?.id === StaticSettings.settingsInstance.userId ||
			textActivity.user?.id === StaticSettings.settingsInstance.userId) {
			const editButton = this.createEditButton(activity, (editedValue) => {
				this.markdown.innerHTML = Markdown.parse(editedValue);
				Markdown.applyFunctions(this.markdown);
			});

			dropdownItems.push({item: editButton, value: "edit"});
		}

		if (message.recipient?.id === StaticSettings.settingsInstance.userId ||
			message.messenger?.id === StaticSettings.settingsInstance.userId ||
			textActivity.user?.id === StaticSettings.settingsInstance.userId) {
			const deleteButton = this.createDeleteButton("ACTIVITY", activity.id, () => {
				this.element.remove();
			})
			dropdownItems.push({item: deleteButton, value: "delete"});
		}

		new DropdownMenuComponent(dropdownItems, dropdownTrigger, (_) => {});

		time.prepend(subscribeButton, dropdownTrigger);

		const actions = this.createActions(activity);
		wrap.append(text, time, actions);
		const replyWrap = this.createReplyWrap();
		if (activity.replies) {
			this.activityReplies.replaceChildren();
			this.appendReplies(activity.replies);
			actions.querySelector(".action.replies")?.setAttribute("queried", "true");
		}
		this.element.append(wrap, replyWrap);
		this.element.append(this.editContainer);
	}

	createText(activity: IMessageActivity | ITextActivity) {
		const text = DOM.create("div", ".text");

		const header = DOM.create("div", ".header");

		if (activity.type === "TEXT") {
			const textActivity = activity as ITextActivity;
			const user = this.createHeaderUser(textActivity.user);
			header.append(user.avatar, user.name);
			if (user.moderatorBadge) {
				header.append(user.moderatorBadge);
			}
			if (user.donatorBadge) {
				header.append(user.donatorBadge);
			}
		} else {
			const messageActivity = activity as IMessageActivity;
			const messenger = this.createHeaderUser(messageActivity.messenger);
			const recipient = this.createHeaderUser(messageActivity.recipient);

			header.append(messenger.avatar, messenger.name);
			if (messenger.donatorBadge) {
				header.append(messenger.donatorBadge)
			}

			header.append(ArrowLongRightIcon());

			header.append(recipient.avatar, recipient.name);
			if (recipient.donatorBadge) {
				header.append(recipient.donatorBadge)
			}
		}

		const activityMarkdown = DOM.create("div", ".activity-markdown");
		this.markdown = DOM.create("div", ".markdown");
		// @ts-ignore
		this.markdown.innerHTML = Markdown.parse(activity.message ?? activity.text);
		Markdown.applyFunctions(this.markdown);
		activityMarkdown.append(this.markdown);

		text.append(header, activityMarkdown);
		return text;
	}
}
