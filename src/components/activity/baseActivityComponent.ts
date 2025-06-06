import {IUser, ModeratorRole} from "../../api/types/user";
import {DOM} from "../../utils/DOM";
import {Time} from "../../utils/time";
import {
	AdminIcon, AnimeDataModIcon, CharacterDataModIcon,
	CommunityModIcon, DeveloperIcon, DiscordModIcon,
	LikeIcon,
	LinkIcon, MangaDataModIcon,
	PencilSquareIcon,
	ReplyIcon, RetiredModIcon, SocialMediaModIcon, StaffDataModIcon,
	SubscribeBellIcon, XMarkIcon
} from "../../assets/icons";
import {AnilistAPI} from "../../api/anilistAPI";
import {StaticSettings} from "../../utils/staticSettings";
import {Toaster} from "../../utils/toaster";
import {IListActivity} from "../../api/types/IListActivity";
import {IMessageActivity} from "../../api/types/messageActivity";
import {IActivityReply} from "../../api/queries/queryActivityReplies";
import {MarkdownEditor} from "../../handlers/messageFeed/markdownEditor";
import {Markdown} from "../../utils/markdown";
import {Loader} from "../loader";
import {ITextActivity} from "../../api/types/ITextActivity";
import {IPageInfo} from "../../api/types/IPageInfo";
import {StaticTooltip} from "../../utils/staticTooltip";
import {Dialog} from "../../utils/dialog";

export class BaseActivityComponent {
	private replyMarkdownEditor: MarkdownEditor;
	activityReplies: HTMLDivElement;
	activityId: number;

	editMarkdownEditor: MarkdownEditor;
	editContainer: HTMLDivElement;
	editCallback: (editedValue: string) => void;
	editType: "TEXT" | "MESSAGE" | "REPLY";
	editActivityId: number;


	constructor(activityId: number) {
		this.activityId = activityId;
		this.replyMarkdownEditor = new MarkdownEditor(async (reply) => {
			try {
				const data = await AnilistAPI.replyToActivity(this.activityId, reply);
				this.activityReplies.append(this.createReply(data));
				this.activityReplies.append(this.replyMarkdownEditor.element);
			} catch (error) {
				Toaster.error("Failed to save reply.", error);
			}
		});
		this.createEditMarkdownEditor();
	}

	createEditMarkdownEditor() {
		// return;
		this.editContainer = DOM.create("div", "markdown-edit-container");
		this.editMarkdownEditor = new MarkdownEditor(async (value) => {
			try {
				const data = await AnilistAPI.saveActivityText(this.editType, this.editActivityId, value);
				this.editCallback(data.text ?? data.message);
			} catch (error) {
				Toaster.error(`Failed to save ${this.editType}.`, error);
			}
		}, () => {
			this.closeEditDialog();
		});
		// this.editMarkdownEditor.toggleVisibility(true);
		this.editContainer.append(DOM.create("div", "markdown-edit-content", this.editMarkdownEditor.element));
	}

	openEditDialog(item: IActivityReply | ITextActivity | IMessageActivity, saveCallback: (editedValue: string) => void) {
		this.editCallback = saveCallback;
		this.editActivityId = item.id;
		const reply = item as IActivityReply;
		const text = item as ITextActivity;
		const message = item as IMessageActivity;
		if (text.type === "TEXT") {
			this.editType = "TEXT"
		} else if (message.type === "MESSAGE") {
			this.editType = "MESSAGE"
		} else {
			this.editType = "REPLY";
		}
		const content = reply.text ?? text.text ?? message.message;
		this.editContainer.classList.add("void-visible");
		document.body.classList.add("scroll-lock");
		this.editMarkdownEditor.textArea.focus();
		this.editMarkdownEditor.handlePreviewVisibility();
		this.editMarkdownEditor.setContent(content);
		this.editMarkdownEditor.handleInput(content);
	}

	private closeEditDialog() {
		this.editContainer.classList.remove("void-visible");
		document.body.classList.remove("scroll-lock");
	}

	createHeaderUser(user: IUser): {
		name: HTMLAnchorElement,
		avatar: HTMLAnchorElement,
		donatorBadge: HTMLDivElement | null,
		moderatorBadge: HTMLDivElement | null
	} {
		return BaseActivityComponent.createHeaderUser(user);
	}

	static createHeaderUser(user: IUser): {
		name: HTMLAnchorElement,
		avatar: HTMLAnchorElement,
		donatorBadge: HTMLDivElement | null,
		moderatorBadge: HTMLDivElement | null
	} {
		const avatar = DOM.create<HTMLAnchorElement>("a", ".avatar");
		avatar.setAttribute("href", `/user/${user.name}/`);
		avatar.setAttribute("style", `background-image: url(${user.avatar.large});`);

		const name = DOM.create<HTMLAnchorElement>("a", ".name", user.name);
		name.setAttribute("href", `/user/${user.name}/`);

		let donatorBadge: HTMLDivElement = null;
		if (user.donatorTier > 0) {
			donatorBadge = DOM.create("div", ".donator-badge", user.donatorTier > 3 ? user.donatorBadge : "Donator");
			if (user.donatorTier > 4) {
				donatorBadge.classList.add("donator-rainbow-badge");
			}
		}

		let moderatorBadge: HTMLDivElement = null;
		if (user.moderatorRoles?.length > 0 && !user.moderatorRoles.includes("RETIRED")) {
			moderatorBadge = DOM.create("div", ".mod-badge-wrap .donator-badge .mod-badge");
			const modBadge = DOM.create("div", ".mod-badge");
			const icon = this.getModIcon(user.moderatorRoles[0]);
			const strong = DOM.create("strong", ".label", this.getModDescription(user.moderatorRoles[0]));
			modBadge.append(icon, strong);
			moderatorBadge.append(modBadge);

			const modTooltip = DOM.create("div", "mod-tooltip");
			for (const modRole of user.moderatorRoles) {
				const item = DOM.create("div", null,
					[this.getModIcon(modRole), DOM.create("strong", null, this.getModDescription(modRole))]);
				modTooltip.append(item);
			}
			StaticTooltip.register(moderatorBadge, modTooltip);
		}

		return {name, avatar, donatorBadge, moderatorBadge};
	}

	createTime(timestamp: number): HTMLDivElement {
		const timeAction = DOM.createDiv(".action .time");
		const time = DOM.create("time", null, Time.convertToString(timestamp));
		const date = Time.convertToDate(timestamp);
		time.setAttribute("timestamp", date.toString());
		StaticTooltip.register(time, Time.toLocaleString(date));
		timeAction.append(time);
		return timeAction;
	}

	createSubscribeButton(activity: IListActivity | IMessageActivity | ITextActivity): HTMLSpanElement {
		const subscribeButton = DOM.create<HTMLSpanElement>("span", ".action .has-label", SubscribeBellIcon());
		subscribeButton.setAttribute("label", activity.isSubscribed ? "Unsubscribe" : "Subscribe");
		if (activity.isSubscribed) {
			subscribeButton.classList.add("active");
		}

		subscribeButton.addEventListener("click", async () => {
			try {
				const subscribe = subscribeButton.getAttribute("label") === "Subscribe";
				const data = await AnilistAPI.toggleActivitySubscription(activity.id, subscribe);
				subscribeButton.setAttribute("label", data.isSubscribed ? "Unsubscribe" : "Subscribe");
			} catch (error) {
				Toaster.error("Failed to toggle activity subscription", error);
			}
		});
		return subscribeButton;
	}

	createDirectLink(activity: IListActivity | IMessageActivity | ITextActivity): HTMLAnchorElement {
		const directLink = DOM.create<HTMLAnchorElement>("a", null, [LinkIcon(), "Direct Link"]);
		directLink.setAttribute("href", `/activity/${activity.id}`);
		return directLink;
	}

	createActions(activity: IListActivity | IMessageActivity | ITextActivity): HTMLDivElement {
		const actions = DOM.createDiv(".actions");

		const replies = DOM.create("div", ".action .replies");
		const replyCount = DOM.create("span", ".count", activity.replyCount);
		const replyIcon = ReplyIcon();
		replies.append(replyCount, replyIcon);

		replies.addEventListener("click", async () => {
			if (!this.activityReplies) {
				return;
			}
			this.activityReplies.classList.toggle("void-hidden");
			if (replies.getAttribute("queried") === "true") {
				return;
			}
			try {
				const repliesData = await AnilistAPI.queryActivityReplies(activity.id);
				this.activityReplies.replaceChildren();
				this.appendReplies(repliesData.replies, repliesData.pageInfo);
				replies.setAttribute("queried", "true");
			} catch (error) {
				Toaster.error("Failed to query activity replies.", error);
				this.activityReplies?.classList.add("void-hidden");
				return;
			}
		});

		const likes = this.createLikeAction(activity.id, "ACTIVITY", activity.likes, activity.likeCount, activity.isLiked);

		actions.append(replies, likes);
		return actions;
	}

	createLikeAction(id: number, type: "ACTIVITY" | "ACTIVITY_REPLY", likes: IUser[], likeCount: number, isLiked: boolean) {
		const likesContainer = DOM.create("div", ".action .likes");
		const likeWrapActivity = DOM.create("div", ".like-wrap .activity");
		likesContainer.append(likeWrapActivity);
		const users = DOM.create("div", ".users");
		users.setAttribute("style", "display: none;");
		for (const user of likes) {
			const likeUser = DOM.create("a", ".user");
			likeUser.setAttribute("style", `background-image: url(${user.avatar.large})`);
			likeUser.setAttribute("href", `/user/${user.name}/`);
			users.append(likeUser);
		}
		const likeButton = DOM.create("div", ".button");
		if (isLiked) {
			likeButton.classList.add("liked");
		}

		const likeCountSpan = DOM.create("span", ".count", likeCount);
		const likeIcon = LikeIcon();
		likeButton.append(likeCountSpan, likeIcon);
		likeWrapActivity.append(users, likeButton);

		likeButton.addEventListener("click", async () => {
			try {
				const data = await AnilistAPI.toggleLike(id, type);
				if (data.isLiked) {
					likeButton.classList.add("liked");
				} else {
					likeButton.classList.remove("liked");
				}
				likeCountSpan.innerText = data.likeCount.toString();
			} catch (error) {
				Toaster.error("Failed to like activity or reply.", error);
			}
		})

		likeWrapActivity.addEventListener("mouseover", () => {
			users.style.display = "initial";
		});
		likeWrapActivity.addEventListener("mouseout", () => {
			users.style.display = "none";
		});

		return likesContainer;
	}

	createReplyWrap() {
		const replyWrap = DOM.create("div", ".reply-wrap");
		this.activityReplies = DOM.create("div", ".activity-replies hidden");
		this.activityReplies.append(Loader());

		replyWrap.append(this.activityReplies);
		return replyWrap;
	}

	appendReplies(replies: IActivityReply[], pageInfo?: IPageInfo) {
		for (const reply of replies) {
			this.activityReplies.append(this.createReply(reply));
		}

		this.addLoadMoreRepliesButton(pageInfo);

		this.activityReplies.append(this.replyMarkdownEditor.element);
	}

	private addLoadMoreRepliesButton(pageInfo?: IPageInfo) {
		if (!pageInfo || pageInfo.perPage * pageInfo.currentPage > pageInfo.total) {
			return;
		}
		const loadMoreButton = DOM.create("div", ".load-more", "Load More");
		loadMoreButton.addEventListener("click", async () => {
			const loader = Loader();
			loadMoreButton.replaceWith(loader);
			try {
				const data = await AnilistAPI.queryActivityReplies(this.activityId, pageInfo.currentPage + 1);
				loader.remove();
				this.appendReplies(data.replies, data.pageInfo)
			} catch (error) {
				Toaster.error("Failed to query replies.", error);
			}
		})
		this.activityReplies.append(loadMoreButton);
	}

	createReply(reply: IActivityReply) {
		const replyContainer = DOM.create("div", ".reply");
		replyContainer.setAttribute("void-reply-id", reply.id.toString());
		const {name, avatar, moderatorBadge} = this.createHeaderUser(reply.user);
		const header = DOM.create("div", ".header", [avatar, name]);

		if (moderatorBadge) {
			header.append(moderatorBadge);
		}

		const actions = DOM.create("div", ".actions");
		const likeAction = this.createLikeAction(reply.id, "ACTIVITY_REPLY", reply.likes, reply.likeCount, reply.isLiked);
		const timeAction = this.createTime(reply.createdAt);

		actions.append(likeAction, timeAction);
		if (StaticSettings.options.replyDirectLinksEnabled.getValue()) {
			const directLink = DOM.createAnchor(`/activity/${this.activityId}?void-reply-id=${reply.id}`, "has-icon reply-direct-link icon-ml", LinkIcon());
			actions.prepend(directLink);
		}
		header.append(actions);

		const replyMarkdown = DOM.create("div", ".reply-markdown");
		const markdown = DOM.createDiv(".markdown");
		markdown.innerHTML = Markdown.parse(reply.text);
		Markdown.applyFunctions(markdown);
		replyMarkdown.append(markdown);

		if (reply.user.id === StaticSettings.settingsInstance.userId) {
			const editButton = this.createEditButton(reply, (editedValue) => {
				markdown.innerHTML = Markdown.parse(editedValue);
				Markdown.applyFunctions(markdown);
			});
			const deleteButton = this.createDeleteButton("REPLY", reply.id, () => {
				replyContainer.remove();
			})
			editButton.classList.add("action");
			deleteButton.classList.add("action");
			editButton.classList.add("void-action");
			deleteButton.classList.add("void-action");
			actions.prepend(editButton, deleteButton);
		}

		replyContainer.append(header, replyMarkdown);
		return replyContainer;
	}

	createEditButton(activity: IMessageActivity | ITextActivity | IActivityReply, callback: (editedValue) => void): HTMLDivElement {
		const editButton = DOM.createDiv(null, [PencilSquareIcon(), "Edit"]);
		editButton.addEventListener("click", () => {
			this.openEditDialog(activity, (editedValue) => {
				callback(editedValue);
			});
		});
		return editButton;
	}

	createDeleteButton(type: "ACTIVITY" | "REPLY", id: number, callback: () => void) {
		const deleteButton = DOM.create<HTMLDivElement>("div", null, [XMarkIcon(), "Delete"]);
		deleteButton.addEventListener("click", () => {
			Dialog.confirm(async () => {
				try {
					await AnilistAPI.deleteActivity(type, id);
					callback();
				} catch (error) {
					Toaster.error("Failed to delete activity or reply.", error);
				}
			}, "Are you sure you want to delete this?");
		});
		return deleteButton;
	}

	private static getModDescription(modRole: ModeratorRole) {
		const modRoleCased = modRole.charAt(0) + modRole.slice(1).toLowerCase().split("_").map(x => x.charAt(0).toLowerCase() + x.slice(1)).join(" ");
		switch (modRole) {
			case "ADMIN":
			case "LEAD_DEVELOPER":
			case "DEVELOPER":
				return modRoleCased;
			default:
				return modRoleCased + " mod";
		}
	}

	private static getModIcon(modRole: ModeratorRole) {
		switch (modRole) {
			case "ADMIN":
				return AdminIcon();
			case "LEAD_DEVELOPER":
			case "DEVELOPER":
				return DeveloperIcon();
			case "LEAD_COMMUNITY":
			case "COMMUNITY":
				return CommunityModIcon();
			case "DISCORD_COMMUNITY":
				return DiscordModIcon();
			case "LEAD_ANIME_DATA":
			case "ANIME_DATA":
				return AnimeDataModIcon();
			case "LEAD_MANGA_DATA":
			case "MANGA_DATA":
				return MangaDataModIcon();
			case "LEAD_SOCIAL_MEDIA":
			case "SOCIAL_MEDIA":
				return SocialMediaModIcon();
			case "RETIRED":
				return RetiredModIcon();
			case "CHARACTER_DATA":
				return CharacterDataModIcon();
			case "STAFF_DATA":
				return StaffDataModIcon();
		}
	}
}
