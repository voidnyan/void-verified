import {StaticSettings} from "../utils/staticSettings";
import {Common} from "../utils/common";
import {AnilistAPI} from "../api/anilistAPI";
import {Toaster} from "../utils/toaster";
import {BasicCache} from "../utils/basicCache";
import {IMediaList} from "../api/types/IMediaList";
import {LocalStorageCacheKeys} from "../assets/localStorageKeys";
import {CacheTimes} from "../assets/cacheTimes";
import {DOM} from "../utils/DOM";
import {AddIcon, NoteIcon, RefreshIcon, RepeatIcon} from "../assets/icons";
import {StaticTooltip} from "../utils/staticTooltip";
import {Dialog} from "../utils/dialog";
import {IconButton} from "../components/components";
import {DomPurify} from "../utils/domPurify";
import {Markdown} from "../utils/markdown";

interface ISocialTab {
	mediaId: number;
	mediaLists: IMediaList[]
}

export class MediaListHandler {
	private static queryInProgress = false;
	private static cache: BasicCache<ISocialTab> = new BasicCache<ISocialTab>(LocalStorageCacheKeys.socialTab, CacheTimes.socialTabCache);

	static async handleSocialTab() {
		if (!StaticSettings.options.socialTabEnhancementEnabled.getValue() || this.queryInProgress) {
			return;
		}

		const path = window.location.pathname;
		if (!((path.startsWith("/anime") || path.startsWith("/manga"))
			&& path.endsWith("/social"))) {
			return;
		}

		const [type, id] = Common.getTypeAndIdFromUrl(path);
		if (!type || !id) {
			return;
		}

		const following = document.querySelector(".following[void-social-tab='true']");
		if (following) {
			return;
		}

		const socialTab = await this.getSocialTabMediaLists(id);
		this.renderSocialTabEnhancements(socialTab);
	}

	private static renderSocialTabEnhancements(socialTab: ISocialTab) {
		for (const mediaList of socialTab.mediaLists) {
			Common.waitToRender(`.following a[href='/user/${mediaList.user.name}/']`, () => {
				this.renderSocialTabEnhancement(mediaList);
			})
		}

		document.querySelector(".following").setAttribute("void-social-tab", "true");
	}

	private static renderSocialTabEnhancement(mediaList: IMediaList) {
		const entryElement = document.querySelector(`.following a[href='/user/${mediaList.user.name}/']`);
		if (!entryElement)
			return;

		let progress = `${mediaList.progress}`;
		if (mediaList.media.chapters || mediaList.media.episodes)
			progress += `/${mediaList.media.episodes ?? mediaList.media.chapters}`;

		const progressContainer = DOM.createDiv("social-tab-data", progress);
		entryElement.querySelector(".status").after(progressContainer);

		const repeatContainer = DOM.createDiv("social-tab-data");
		if (mediaList.repeat > 0) {
			const repeatIcon = RepeatIcon();
			StaticTooltip.register(repeatIcon, mediaList.repeat);
			repeatContainer.append(repeatIcon);
		}
		progressContainer.after(repeatContainer);

		const noteContainer = DOM.createDiv("social-tab-data");
		if (mediaList.notes) {
			const noteIcon = NoteIcon();
			noteIcon.addEventListener("click", (e: Event) => {
				e.stopPropagation();
				e.preventDefault();
				Dialog.markdown(Markdown.parse(mediaList.notes), `${mediaList.user.name}'s notes`);
			});
			noteContainer.append(noteIcon);
		}
		repeatContainer.after(noteContainer);
	}

	private static async getSocialTabMediaLists(id: number) : Promise<ISocialTab> {
		const cachedMediaList = await this.cache.getItem(x => x.mediaId === id);
		if (cachedMediaList)
			return cachedMediaList;

		const socialTab: ISocialTab = {
			mediaId: id,
			mediaLists: []
		};

		try {
			this.queryInProgress = true;
			Toaster.debug("Querying social tab");
			const [data, pageInfo] = await AnilistAPI.getSocialTabFollowingList(id);
			socialTab.mediaLists.push(...data);
		} catch (e) {
			Toaster.error("Failed to query social tab", e);
			return;
		} finally {
			this.queryInProgress = false;
		}
		return socialTab;
	}
}
