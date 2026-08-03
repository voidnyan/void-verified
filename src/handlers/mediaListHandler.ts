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

	static handleMediaListNotes() {
		const notes = document.querySelectorAll<HTMLSpanElement>(".entry.row .notes");

		for (const note of notes) {
			const noteText = note.getAttribute("label");
			const title = note.parentNode.querySelector("a").innerText.trim();
			note.addEventListener("click", (e) => {
				Dialog.markdown(Markdown.parse(noteText), title);
			});
			note.setAttribute("void-media-list-note", "true");
		}
	}

	static async handleSocialTab(forceRequery = false) {
		if ((!StaticSettings.options.socialTabEnhancementEnabled.getValue() || this.queryInProgress && !forceRequery) ) {
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
		if (following && !forceRequery) {
			return;
		}

		const socialTab = await this.getSocialTabMediaLists(id, forceRequery);
		this.renderSocialTabEnhancements(socialTab);
	}

	private static renderSocialTabEnhancements(socialTab: ISocialTab) {
		for (const mediaList of socialTab.mediaLists) {
			Common.waitToRender(`.following a[href='/user/${mediaList.user.name}/']`, () => {
				this.renderSocialTabEnhancement(mediaList);
			})
		}

		Common.waitToRender(".following", () => {
			const following = document.querySelector(".following");
			following.setAttribute("void-social-tab", "true");

			const refreshButton = IconButton(RefreshIcon(), async () => {
				await this.handleSocialTab(true);
			});

			const header = following.parentNode.querySelector("h2");
			if (header && !header.querySelector(".void-icon-button"))
				header.append(refreshButton);
		});
	}

	private static renderSocialTabEnhancement(mediaList: IMediaList) {
		const entryElement = document.querySelector(`.following a[href='/user/${mediaList.user.name}/']`);
		if (!entryElement)
			return;

		let progress = `${mediaList.progress}`;
		if (mediaList.media.chapters || mediaList.media.episodes)
			progress += `/${mediaList.media.episodes ?? mediaList.media.chapters}`;

		let progressContainer = entryElement.querySelector(".void-social-tab-progress");
		if (progressContainer) {
			progressContainer.replaceChildren(progress);
		} else {
			progressContainer = DOM.createDiv("social-tab-data social-tab-progress", progress);
			entryElement.querySelector(".status").after(progressContainer);
		}

		let repeatContainer = entryElement.querySelector(".void-social-tab-repeat");
		if (!repeatContainer) {
			repeatContainer = DOM.createDiv("social-tab-data social-tab-repeat");
			progressContainer.after(repeatContainer);
		}
		repeatContainer.replaceChildren();
		if (mediaList.repeat > 0) {
			const repeatIcon = RepeatIcon();
			StaticTooltip.register(repeatIcon, mediaList.repeat);
			repeatContainer.append(repeatIcon);
		}

		let noteContainer = entryElement.querySelector(".void-social-tab-notes");
		if (!noteContainer) {
			noteContainer = DOM.createDiv("social-tab-data social-tab-notes cursor-pointer");
			repeatContainer.after(noteContainer);
		}
		noteContainer.replaceChildren();

		if (mediaList.notes) {
			const noteIcon = NoteIcon();
			noteIcon.addEventListener("click", (e: Event) => {
				e.stopPropagation();
				e.preventDefault();
				Dialog.markdown(Markdown.parse(mediaList.notes), `${mediaList.user.name}'s notes`);
			});
			noteContainer.append(noteIcon);
		}
	}

	private static async getSocialTabMediaLists(id: number, forceRequery: boolean) : Promise<ISocialTab> {
		if (!forceRequery) {
			const cachedMediaList = await this.cache.getItem(x => x.mediaId === id);
			if (cachedMediaList)
				return cachedMediaList;
		} else {
			await this.cache.removeItem(x => x.mediaId === id);
		}

		const socialTab: ISocialTab = {
			mediaId: id,
			mediaLists: []
		};

		try {
			this.queryInProgress = true;
			Toaster.debug("Querying social tab");
			const [data, _] = await AnilistAPI.getSocialTabFollowingList(id);
			socialTab.mediaLists.push(...data);
		} catch (e) {
			Toaster.error("Failed to query social tab", e);
			return;
		} finally {
			this.queryInProgress = false;
		}
		await this.cache.setItem(socialTab);
		return socialTab;
	}
}
