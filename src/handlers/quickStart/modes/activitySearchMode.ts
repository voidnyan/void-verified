import {DOM} from "../../../utils/DOM";
import {QuickStartHandler, QuickStartMode} from "../quickStartHandler";
import {IMediaSearchResult, MediaSearchComponent} from "../../../components/MediaSearchComponent";
import {UserSearchComponent} from "../../../components/UserSearchComponent";
import {IUserSearchResult} from "../../../api/types/IUserSearchResult";
import {Button, Checkbox, DateInput, RangeField, SettingLabel} from "../../../components/components";
import {Time} from "../../../utils/time";
import {AnilistAPI} from "../../../api/anilistAPI";
import {StaticSettings} from "../../../utils/staticSettings";
import {Toaster} from "../../../utils/toaster";
import {IListActivity} from "../../../api/types/IListActivity";
import {ListActivityComponent} from "../../../components/activity/listActivityComponent";
import {MediaDisplayComponent} from "../../../components/MediaDisplayComponent";
import {ArrowsLeftRightIcon} from "../../../assets/icons";
import {SelectComponent} from "../../../components/selectComponent";
import {TextActivityComponent} from "../../../components/activity/textActivityComponent";
import {IMessageActivity} from "../../../api/types/messageActivity";
import {ITextActivity} from "../../../api/types/ITextActivity";
import {ActivityReplyQueryPartial} from "../../../api/queries/queryActivityReplies";
import {FuzzyMatch} from "../../../utils/fuzzyMatch";
import {IVerifiedUser} from "../../../types/settings";
import {LatestMediaSearches} from "./latestMediaSearches";
import {Loader} from "../../../components/loader";
import {CollapsibleContainer} from "../../../components/collapsibleContainer";
import {IPageInfo} from "../../../api/types/IPageInfo";

type ActivitySearchType = "List" | "Text" | "Message";

const collapsibleClasses = {
	head: "quick-start-activity-search-params-container-head",
	body: "quick-start-activity-search-params-container-body"
}

export class ActivitySearchMode {
	private static media: IMediaSearchResult[] = [];
	private static user: IUserSearchResult[] = [];
	private static recipients: IUserSearchResult[] = [];
	private static before: string;
	private static after: string;

	private static mode: ActivitySearchType = "List"
	private static feed: "Following" | "Global";
	private static sort: "Newest" | "Oldest";
	private static includeReplies: boolean;
	private static hasReplies: boolean;
	private static perPage: number;

	private static parametersContainer: HTMLDivElement;
	private static activityFeed: HTMLDivElement;
	private static usersDisplay: CollapsibleContainer;
	private static recipientDisplay: CollapsibleContainer;
	private static mediaDisplay: CollapsibleContainer;

	private static activities: Array<IListActivity | IMessageActivity | ITextActivity> = [];
	private static filter = "";

	private static searchButton: HTMLElement;

	private static queryUsed: string;
	private static paramsUsed: object;
	private static isCreated: boolean;
	private static pageInfo: IPageInfo;

	private static scroll: number;

	static handleMode() {
		const [head, content] = this.createParametersContainer();
		QuickStartHandler.headContainer.append(head);
		QuickStartHandler.resultsContainer.append(content);
		if (QuickStartHandler.config.preserveActivitySearch) {
			QuickStartHandler.container.scrollTop = this.scroll;
		}
	}

	static handleCommand(command: string) {
		this.filter = command;
		this.appendActivities(this.activities);
	}

	private static createParametersContainer(): [HTMLDivElement, HTMLDivElement] {
		if (QuickStartHandler.config.preserveActivitySearch && this.isCreated) {
			return [this.parametersContainer, this.activityFeed];
		}
		this.activities = [];
		this.media = [];
		this.user = [];
		this.recipients = [];
		this.mode = "List";
		this.feed = "Following";
		this.sort = "Newest";
		this.queryUsed = undefined;
		this.pageInfo = undefined;
		this.paramsUsed = undefined;
		this.hasReplies = false;
		this.includeReplies = false;
		this.perPage = 15;
		this.parametersContainer = DOM.create("div", "quick-start-activity-search-params-container");
		this.activityFeed = DOM.create("div", "activity-feed .activity-feed");
		this.preloadParameters();
		this.createParameters();
		if (QuickStartHandler.config.preserveActivitySearch) {
			this.isCreated = true;
			QuickStartHandler.container.addEventListener("scroll", (event) => {
				if (QuickStartHandler.mode === QuickStartMode.ActivitySearch) {
					// @ts-ignore
					this.scroll = event.target.scrollTop;
				}
			})
		} else {
			this.isCreated = false;
		}
		return [this.parametersContainer, this.activityFeed];
	}

	private static createParameters() {
		this.parametersContainer.replaceChildren();
		this.createBaseProperties();

		if (this.mode === "List") {
			this.createMediaParams();
		}
		this.createUserParams();

		this.searchButton = Button("Search Activity", () => {
			this.searchActivity();
		}, "quick-start-search-activity-button")

		const clearButton = Button("Clear Feed", () => {
			this.activityFeed.replaceChildren();
			this.activities = [];
		}, "error");

		const actionContainer = DOM.create("div", "quick-start-activity-search-action-container", [clearButton, this.searchButton]);

		this.parametersContainer.append(actionContainer);
	}


	private static createBaseProperties() {
		const activityTypeSelect = new SelectComponent(this.mode, ["List", "Text", "Message"], (value: "List" | "Text" | "Message") => {
			this.mode = value;
			this.createParameters();
		});

		activityTypeSelect.element.addEventListener("click", (event) => {
			event.stopPropagation();
		});

		const feedSelect = new SelectComponent(this.feed, ["Following", "Global"], (value: "Following" | "Global") => {
			this.feed = value;
		});
		const sortSelect = new SelectComponent(this.sort, ["Newest", "Oldest"], (value: "Newest" | "Oldest") => {
			this.sort = value;
		});
		const hasReplies = SettingLabel("Has replies", Checkbox(this.hasReplies, (event) => {
			this.hasReplies = event.target.checked;
		}))

		const includeReplies = SettingLabel("Preload replies (only recommended if you are going to filter through them)", Checkbox(this.includeReplies, (event) => {
			this.includeReplies = event.target.checked;
		}))

		const perPage = SettingLabel("Results per page", RangeField(this.perPage, (event) => {
			this.perPage = event.target.value;
		}, 50, 1, 1));

		const dateRange = this.createDateRangeParams();

		const container = new CollapsibleContainer(
			activityTypeSelect.element,
			[
				feedSelect.element,
				sortSelect.element,
				hasReplies,
				includeReplies,
				perPage,
				dateRange
			],
			{
				body: "quick-start-activity-search-base-params"
			},
			null,
			"quick-start-search-props");

		this.parametersContainer.append(container.element);
	}

	private static createMediaParams() {
		const mediaCache = new CollapsibleContainer(
			"Latest Media Searches",
			this.createMediaCacheItems(),
			{
				head: collapsibleClasses.head,
				body: collapsibleClasses.body + " quick-start-media-cache"
			},
			"No Previous Media.",
			"quick-start-media-cache");

		const mediaSearch = new MediaSearchComponent((value) => {
			this.addMedia(value);
			LatestMediaSearches.add(value);
			mediaCache.body.replaceChildren(...this.createMediaCacheItems());
		}, true);

		mediaSearch.element.addEventListener("click", (event) => {
			event.stopPropagation();
		});

		this.mediaDisplay = new CollapsibleContainer(
			mediaSearch.element,
			this.media.map(x => this.createSelectedMediaItem(x)),
			collapsibleClasses,
			"No media selected.",
			"quick-start-selected-media");
		this.parametersContainer.append(
			mediaCache.element,
			this.mediaDisplay.element);
		this.renderSelectedMedia();
	}

	private static createMediaCacheItems() {
		return LatestMediaSearches.get().map(x => {
			const item = new MediaDisplayComponent(x);
			item.element.addEventListener("click", () => {
				this.addMedia(x);
			});
			return item.element;
		});
	}

	private static createUserParams() {
		const userSearch = new UserSearchComponent((value) => {
			this.addUser(value);
		});

		if (StaticSettings.settingsInstance.verifiedUsers?.length > 0) {
			const verifiedUserSelection = this.createVerifiedUsersSelector();
			this.parametersContainer.append(verifiedUserSelection.element);
		}
		userSearch.input.setAttribute("placeholder", this.mode === "Message" ? "Search Messagers" : "Search Users");
		userSearch.element.addEventListener("click", (event) => {
			event.stopPropagation();
		});
		this.usersDisplay = new CollapsibleContainer(
			[userSearch.element,
				Button("Remove All", (event) => {
					event.stopPropagation();
					for (const user of this.user) {
						this.removeUser(user, false);
					}
					this.renderSelectedUsers(false);
				}, "all-users-button")],
			this.user.map(x => {
				const user = this.createUserItem(x)
				user.addEventListener("click", () => {
					this.removeUser(x);
					this.renderSelectedUsers();
				});
				return user;
			}),
			collapsibleClasses,
			"No users selected.",
			"quick-start-selected-users"
		);
		this.parametersContainer.append(this.usersDisplay.element);

		this.renderSelectedUsers();

		if (this.mode !== "Message") {
			return;
		}

		const recipientSearch = new UserSearchComponent((value) => {
			this.addUser(value, true);
		})

		recipientSearch.input.setAttribute("placeholder", "Search Recipients");
		recipientSearch.element.addEventListener("click", (event) => {
			event.stopPropagation();
		})

		if (StaticSettings.settingsInstance.verifiedUsers?.length > 0) {
			const verifiedUserSelection = this.createVerifiedUsersSelector(true);
			this.parametersContainer.append(verifiedUserSelection.element);
		}

		this.recipientDisplay = new CollapsibleContainer([recipientSearch.element, Button("Remove All", (event) => {
				event.stopPropagation();
				for (const user of this.recipients) {
					this.removeUser(user, true);
				}
				this.renderSelectedUsers(true);
			}, "all-users-button")],
			this.recipients.map(x => {
				const user = this.createUserItem(x)
				user.addEventListener("click", () => {
					this.removeUser(x, true);
					this.renderSelectedUsers(true);
				});
				return user;
			}),
			collapsibleClasses,
			"No users selected.",
			"quick-start-selected-recipients");
		this.parametersContainer.append(this.recipientDisplay.element);

		this.renderSelectedUsers(true);
	}

	private static verifiedUserToSearchResult(verifiedUser: IVerifiedUser): IUserSearchResult {
		return {
			name: verifiedUser.username,
			avatar: {
				large: verifiedUser.avatar
			},
			id: verifiedUser.id
		}
	}

	private static createDateRangeParams() {
		const afterInput = DateInput(this.after, (event) => {
			this.after = event.target.value;
		});

		const beforeInput = DateInput(this.before, (event) => {
			this.before = event.target.value;
		});

		const dateRange = DOM.create("div", "date-range-container");
		dateRange.append(afterInput, ArrowsLeftRightIcon(), beforeInput);
		return dateRange;
	}

	private static createVerifiedUsersSelector(isRecipient = false): CollapsibleContainer {
		const content = [];
		for (const user of StaticSettings.settingsInstance.verifiedUsers) {
			const userSearchResult: IUserSearchResult = {
				id: user.id,
				avatar: {
					large: user.avatar
				},
				name: user.username
			};
			const item = this.createUserItem(userSearchResult);
			item.addEventListener("click", () => {
				this.addUser(userSearchResult, isRecipient);
			});
			content.push(item);
		}

		const head = ["Verified Users", Button("Select All", (event) => {
			event.stopPropagation();
			for (const user of StaticSettings.settingsInstance.verifiedUsers) {
				this.addUser(this.verifiedUserToSearchResult(user), isRecipient, true);
			}
			this.renderSelectedUsers(false);
		}, "all-users-button")];

		const verifiedUserContainer = new CollapsibleContainer(
			head,
			content,
			collapsibleClasses,
			"No verified users.",
			isRecipient ? "quick-start-verified-recipients" : "quick-start-verified-users");

		return verifiedUserContainer;
	}

	private static addUser(user: IUserSearchResult, isRecipient = false, dontRemove = false) {
		const list = isRecipient ? this.recipients : this.user;
		if (list.every(x => x.id !== user.id)) {
			list.push(user);
		} else if (!dontRemove) {
			this.removeUser(user, isRecipient);
		}
		this.renderSelectedUsers(isRecipient);
	}

	private static removeUser(user: IUserSearchResult, isRecipient = false) {
		if (isRecipient) {
			this.recipients = this.recipients.filter(x => x.id !== user.id);
		} else {
			this.user = this.user.filter(x => x.id !== user.id);
		}
	}

	private static addMedia(media: IMediaSearchResult) {
		if (!this.media.find(x => media.id === x.id)) {
			this.media.push(media);
			this.renderSelectedMedia();
		}
	}

	private static removeMedia(media: IMediaSearchResult) {
		this.media = this.media.filter(x => x.id !== media.id);
	}

	private static renderSelectedUsers(isRecipient = false) {
		const display = isRecipient ? this.recipientDisplay : this.usersDisplay;
		const content = [];
		const users = isRecipient ? this.recipients : this.user;
		for (const user of users) {
			const item = this.createUserItem(user);
			item.addEventListener("click", () => {
				this.removeUser(user, isRecipient);
				this.renderSelectedUsers(isRecipient);
			})
			content.push(item);
		}
		display.setContent(content);
		if (content.length > 0) {
			display.handleCollapse(false);
		}
	}

	private static renderSelectedMedia() {
		const content = [];
		for (const media of this.media) {
			const mediaComponent = this.createSelectedMediaItem(media);
			content.push(mediaComponent);
		}
		this.mediaDisplay.setContent(content);
		if (content.length > 0) {
			this.mediaDisplay.handleCollapse(false);
		}
	}

	private static createSelectedMediaItem(media: IMediaSearchResult) {
		const mediaComponent = new MediaDisplayComponent(media);
		mediaComponent.element.addEventListener("click", () => {
			this.removeMedia(media);
			this.renderSelectedMedia();
		});
		return mediaComponent.element;
	}

	private static createUserItem(user: IUserSearchResult) {
		const item = DOM.create("div", "quick-access-item")
		const avatar = DOM.create("div", "quick-access-pfp");
		avatar.setAttribute("style", `background-image: url(${user.avatar.large})`);
		const name = DOM.create("div", "quick-access-username", user.name);
		item.append(avatar, name);
		return item;
	}

	private static async searchActivity() {
		const [query, params] = this.buildQuery();
		this.searchButton.setAttribute("disabled", "true");
		this.activityFeed.replaceChildren(Loader());
		try {
			const response = await AnilistAPI.query(query, params);
			const activities: IListActivity[] | IMessageActivity[] | ITextActivity[] = response.Page.activities;
			this.activities = activities;
			this.queryUsed = query;
			this.pageInfo = response.Page.pageInfo;
			this.paramsUsed = params;
			this.appendActivities(activities);
		} catch (error) {
			Toaster.error("There was an error querying activities.", error);
		} finally {
			this.searchButton.removeAttribute("disabled");
		}
	}

	private static appendActivities(activities: Array<IListActivity | ITextActivity | IMessageActivity>, clear = true) {
		const activityElements = this.filterActivities(activities).map(x => {
			switch (x.type) {
				case "ANIME_LIST":
				case "MANGA_LIST":
					return new ListActivityComponent(x as IListActivity).element;
				case "TEXT":
				case "MESSAGE":
					return new TextActivityComponent(x as ITextActivity | IMessageActivity).element
			}
		});
		if (this.activities.length < this.pageInfo.total) {
			activityElements.push(this.createLoadMoreButton());
		}
		if (clear) {
			this.activityFeed.replaceChildren(...activityElements);
		} else {
			this.activityFeed.append(...activityElements);
		}
	}

	private static createLoadMoreButton() {
		const button = DOM.createDiv(".load-more", "Load More");
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
			const params = {
				...this.paramsUsed,
				page: this.pageInfo.currentPage + 1
			};
			const response = await AnilistAPI.query(this.queryUsed, params);
			const activities: IListActivity[] | IMessageActivity[] | ITextActivity[] = response.Page.activities;
			this.pageInfo = response.Page.pageInfo;
			this.activities.push(...activities);
			this.appendActivities(activities, false);
		} catch (error) {
			Toaster.error("There was an error querying activities.", error);
		}
	}

	private static filterActivities(activities: Array<IListActivity | ITextActivity | IMessageActivity>): Array<IListActivity | ITextActivity | IMessageActivity> {
		let filteredActivities = [...activities];
		if (this.filter?.length > 0) {
			filteredActivities = filteredActivities.filter(x => {
				let result = false;
				if (x.type === "ANIME_LIST" || x.type === "MANGA_LIST") {
					result = FuzzyMatch.match(this.filter, x.media.title.userPreferred);
					if (!result) {
						result = FuzzyMatch.match(this.filter, x.status);
					}
					if (!result && x.progress) {
						result = FuzzyMatch.match(this.filter, x.progress);
					}
				} else if (x.type === "TEXT") {
					result = FuzzyMatch.match(this.filter, x.text);
				}
				if (x.type === "MESSAGE") {
					result = FuzzyMatch.match(this.filter, x.message);
					if (!result) {
						result = FuzzyMatch.match(this.filter, x.recipient.name);
					}
					if (!result) {
						result = FuzzyMatch.match(this.filter, x.messenger.name);
					}
				} else {
					if (!result) {
						result = FuzzyMatch.match(this.filter, x.user.name);
					}
				}

				if (!result && x.replies) {
					result = x.replies.some(reply => FuzzyMatch.match(this.filter, reply.text));
					if (!result) {
						result = x.replies.some(reply => FuzzyMatch.match(this.filter, reply.user.name));
					}
				}

				return result;
			})
		}

		return filteredActivities;
	}

	private static buildQuery(): [string, object] {
		switch (this.mode) {
			case "List":
				return this.buildMediaQuery();
			case "Text":
				return this.buildTextQuery();
			case "Message":
				return this.buildMessageQuery();
		}
	}

	private static buildMediaQuery(): [string, object] {
		const query = `
			query Query(
			  $perPage: Int,
			  ${this.user.length > 0 ? "$userIdIn: [Int]," : ""}
			  $type: ActivityType,
			  ${this.media.length > 0 ? "$mediaIdIn: [Int]," : ""}
			  ${this.after ? "$createdAtGreater: Int," : ""}
			  ${this.before ? "$createdAtLesser: Int," : ""}
			  $page: Int,
			  $isFollowing: Boolean,
			  $sort: [ActivitySort],
			  $hasReplies: Boolean
			  ) {Page(perPage: $perPage, page: $page) {
				activities(
				${this.user.length > 0 ? "userId_in: $userIdIn," : ""}
				type: $type,
				isFollowing: $isFollowing,
				sort: $sort,
				hasReplies: $hasReplies,
				${this.media.length > 0 ? "mediaId_in: $mediaIdIn," : ""}
				${this.after ? "createdAt_greater: $createdAtGreater," : ""}
				${this.before ? "createdAt_lesser: $createdAtLesser" : ""}
				) {
				  ... on ListActivity {
					createdAt
					id
					isLiked
					isSubscribed
					likeCount
					likes {
					  avatar {
						large
					  }
					  name
					}
					media {
					  coverImage {
						large
					  }
					  type
					  id
					  title {
					  	userPreferred
					  }
					}
					progress
					replyCount
					${this.includeReplies ? `replies {${ActivityReplyQueryPartial}}` : ""}
					status
					type
					user {
					  name
					  id
					  donatorBadge
					  donatorTier
					  moderatorRoles
					  avatar {
						large
					  }
					}
				  }
				}
				pageInfo {
				  hasNextPage
				  currentPage
				  perPage
				  total
				}
			  }
			}
		`;

		const parameters = {
			mediaIdIn: this.media.length > 0 ? this.media.map(x => x.id) : undefined,
			userIdIn: this.user.length > 0 ? this.user.map(x => x.id) : undefined,
			createdAtGreater: this.after ? Time.toAnilistTimestamp(this.after) : undefined,
			createdAtLesser: this.before ? Time.toAnilistTimestamp(this.before) : undefined,
			type: "MEDIA_LIST",
			isFollowing: this.feed === "Following",
			perPage: this.perPage,
			page: 1,
			sort: this.sort === "Newest" ? "ID_DESC" : "ID",
			hasReplies: this.hasReplies
		}

		return [query, parameters];
	}

	private static buildMessageQuery(): [string, object] {
		const query = `query Page(
		$page: Int,
		$perPage: Int,
		$type: ActivityType,
		$isFollowing: Boolean,
		${this.user.length > 0 ? "$messengerIdIn: [Int], " : ""}
		${this.recipients.length > 0 ? "$userIdIn: [Int]," : ""}
		${this.after ? "$createdAtGreater: Int," : ""}
		${this.before ? "$createdAtLesser: Int," : ""}
		$sort: [ActivitySort],
		$hasReplies: Boolean) {
		  Page(page: $page, perPage: $perPage) {
			pageInfo {
			  currentPage
			  hasNextPage
			  perPage
			  total
			}
			activities(
			type: $type,
			isFollowing: $isFollowing,
			hasReplies: $hasReplies,
			${this.user.length > 0 ? "messengerId_in: $messengerIdIn," : ""}
			${this.recipients.length > 0 ? "userId_in: $userIdIn," : ""}
			${this.after ? "createdAt_greater: $createdAtGreater," : ""}
			${this.before ? "createdAt_lesser: $createdAtLesser," : ""}
			sort: $sort) {
			  ... on MessageActivity {
				createdAt
				id
				isLiked
				isSubscribed
				likeCount
				replyCount
				${this.includeReplies ? `replies {${ActivityReplyQueryPartial}}` : ""}
				likes {
				  avatar {
					large
				  }
				  name
				}
				recipient {
				  avatar {
					large
				  }
				  id
				  moderatorRoles
				  donatorTier
				  donatorBadge
				  name
				}
				message
				messenger {
				  avatar {
					large
				  }
				  id
				  moderatorRoles
				  name
				  donatorBadge
				  donatorTier
				}
				type
			  }
			}
		  }
		}`;

		const parameters = {
			messengerIdIn: this.user.length > 0 ? this.user.map(x => x.id) : undefined,
			userIdIn: this.recipients.length > 0 ? this.recipients.map(x => x.id) : undefined,
			createdAtGreater: this.after ? Time.toAnilistTimestamp(this.after) : undefined,
			createdAtLesser: this.before ? Time.toAnilistTimestamp(this.before) : undefined,
			type: "MESSAGE",
			isFollowing: this.feed === "Following",
			perPage: this.perPage,
			page: 1,
			sort: this.sort === "Newest" ? "ID_DESC" : "ID",
			hasReplies: this.hasReplies
		}

		return [query, parameters];
	}

	private static buildTextQuery(): [string, object] {
		const query = `query Page(
		$page: Int,
		$perPage: Int,
		$type: ActivityType,
		${this.user.length > 0 ? "$userIdIn: [Int]," : ""}
		${this.after ? "$createdAtGreater: Int," : ""}
		${this.before ? "$createdAtLesser: Int," : ""}
		$sort: [ActivitySort],
		$isFollowing: Boolean,
		$hasReplies: Boolean) {
		  Page(page: $page, perPage: $perPage) {
			pageInfo {
			  hasNextPage
			  currentPage
			  perPage
			  total
			}
			activities(
			type: $type,
			${this.user.length > 0 ? "userId_in: $userIdIn," : ""}
			${this.after ? "createdAt_greater: $createdAtGreater," : ""}
			${this.before ? "createdAt_lesser: $createdAtLesser," : ""}
			sort: $sort,,
			hasReplies: $hasReplies,
			isFollowing: $isFollowing) {
			  ... on TextActivity {
				createdAt
				isLiked
				isSubscribed
				likeCount
				likes {
				  avatar {
					large
				  }
				  name
				}
				replyCount
				${this.includeReplies ? `replies {${ActivityReplyQueryPartial}}` : ""}
				text
				type
				user {
				  avatar {
					large
				  }
				  moderatorRoles
				  name
				  id
				  donatorBadge
				  donatorTier
				}
				id
			  }
			}
		  }
		}`;

		const parameters = {
			userIdIn: this.user.length > 0 ? this.user.map(x => x.id) : undefined,
			createdAtGreater: this.after ? Time.toAnilistTimestamp(this.after) : undefined,
			createdAtLesser: this.before ? Time.toAnilistTimestamp(this.before) : undefined,
			type: "TEXT",
			isFollowing: this.feed === "Following",
			perPage: this.perPage,
			page: 1,
			sort: this.sort === "Newest" ? "ID_DESC" : "ID",
			hasReplies: this.hasReplies
		}
		return [query, parameters];
	}

	private static preloadParameters() {
		try {
			const [_, type, id] = window.location.pathname.split("/");
			if (window.location.pathname.startsWith("/anime/")) {
				// @ts-ignore
				const title = document.querySelector(".header h1")?.innerText.trim();
				const poster = document.querySelector(".header .cover")?.getAttribute("src");
				const yearHref = document.querySelector(`.value[href*='/search/${type}?']`)?.getAttribute("href");
				const startYear = yearHref.split("=")[1].split("%")[0];
				const media: IMediaSearchResult = {
					id: +id,
					type: type.toUpperCase(),
					title: {
						userPreferred: title
					},
					coverImage: {
						large: poster
					},
					startDate: {
						year: +startYear
					}
				}
				this.media.push(media);
			} else if (window.location.pathname.startsWith("/manga/")) {
				// @ts-ignore
				const title = document.querySelector(".header h1")?.innerText.trim();
				const poster = document.querySelector(".header .cover")?.getAttribute("src");
				const data = [...document.querySelectorAll(".sidebar .data .data-set")];
				// @ts-ignore
				const startDateEntry = data.find(x => x.querySelector(".type").innerText === "Start Date");
				// @ts-ignore
				const startYear = +startDateEntry.querySelector(".value").innerText.split(", ")[1];
				const media: IMediaSearchResult = {
					id: +id,
					type: type.toUpperCase(),
					title: {
						userPreferred: title
					},
					coverImage: {
						large: poster
					},
					startDate: {
						year: +startYear
					}
				}
				this.media.push(media);
			}
		} catch (error) {
			console.error(error);
		}
	}
}
