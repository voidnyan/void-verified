import {IMediaList} from "../api/types/IMediaList";
import {AnilistAPI} from "../api/anilistAPI";
import {DOM} from "../utils/DOM";
import {CheckIcon} from "../assets/icons";
import {Time} from "../utils/time";
import {Toaster} from "../utils/toaster";
import {StaticTooltip} from "../utils/staticTooltip";

interface InProgressEntryOptions {
	onProgressSaved?: (mediaList: IMediaList, progress: number, completed: boolean) => void;
}

export class InProgressEntry {
	private mediaList: IMediaList;
	private counter: HTMLDivElement;
	private saveButton: HTMLButtonElement;
	private progress: number;
	private onProgressSaved?: (mediaList: IMediaList, progress: number, completed: boolean) => void;
	element: HTMLDivElement;
	constructor(mediaList: IMediaList, options: InProgressEntryOptions = {}) {
		this.mediaList = mediaList;
		this.progress = mediaList.progress;
		this.onProgressSaved = options.onProgressSaved;
		this.element = DOM.createDiv("in-progress-entry");
		this.addCover();
		this.addCounterActions();
	}

	private addCover() {
		const cover = DOM.createAnchor(`${this.mediaList.media.type}/${this.mediaList.media.id}`, "in-progress-cover");
		cover.setAttribute("style", `background-image: url("${this.mediaList.media.coverImage.medium}");`);
		this.element.append(cover);

		const episodeDisplay = DOM.createDiv("in-progress-display");
		this.counter = DOM.createDiv("in-progress-counter", this.getCounterText());
		episodeDisplay.append(this.counter);

		cover.append(episodeDisplay);

		if (this.mediaList.media.airingSchedule.nodes.length > 0) {
			const schedule = this.mediaList.media.airingSchedule.nodes[0];
			const airsIn = Time.toUpcomingString(Time.convertToDate(schedule.airingAt));
			cover.append(DOM.createDiv("in-progress-display", [
				DOM.createDiv(null, `Ep ${schedule.episode}`),
				DOM.createDiv(null, airsIn)
			]));
		}

		StaticTooltip.register(cover, this.mediaList.media.title.userPreferred);
	}

	private addCounterActions() {
		const container = DOM.createDiv("in-progress-counter-actions-container");
		const reduce = DOM.createDiv("in-progress-counter-button", "-");
		const add = DOM.createDiv("in-progress-counter-button", "+");

		this.saveButton = DOM.create<HTMLButtonElement>("button", "in-progress-counter-button", CheckIcon());
		this.saveButton.setAttribute("disabled", "true");

		container.append(reduce, add, this.saveButton);
		reduce.addEventListener("click", () => this.add(-1));
		add.addEventListener("click", () => this.add(+1));
		this.saveButton.addEventListener("click", () => this.saveProgress());

		this.element.append(container);
	}

	private add(value: number) {
		this.progress += value;
		if (this.progress < 0) {
			this.progress = 0;
		}
		const maxValue = this.mediaList.media.episodes ?? this.mediaList.media.chapters;
		if (maxValue && this.progress > maxValue) {
			this.progress = maxValue;
		}
		this.counter.replaceChildren(this.getCounterText());

		if (this.progress === this.mediaList.progress) {
			this.saveButton.setAttribute("disabled", "true");
		} else {
			this.saveButton.removeAttribute("disabled");
		}
	}

	private async saveProgress() {
		this.saveButton.setAttribute("disabled", "true");
		try {
			const completed = this.isCompleted();
			await AnilistAPI.updateMediaProgress(this.mediaList.id, this.mediaList.media.id, completed ? "COMPLETED" : null, this.progress);
			this.mediaList.progress = this.progress;
			this.onProgressSaved?.(this.mediaList, this.progress, completed);
			Toaster.success("Progress updated.");
		} catch (error) {
			Toaster.error("Failed to update progress.", error);
			if (this.progress !== this.mediaList.progress) {
				this.saveButton.removeAttribute("disabled");
			}
		}
	}

	private getCounterText() {
		const maxValue = this.mediaList.media.episodes ?? this.mediaList.media.chapters;
		if (!maxValue) {
			return this.progress.toString();
		}
		return `${this.progress} / ${this.mediaList.media.episodes ?? this.mediaList.media.chapters}`;
	}

	private isCompleted() {
		const maxValue = this.mediaList.media.episodes ?? this.mediaList.media.chapters;
		return maxValue && this.progress >= maxValue;
	}
}
