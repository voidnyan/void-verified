import {IFuzzyDate, IMediaOverview} from "../api/queries/mediaOverviewQuery";
import {DOM} from "../utils/DOM";
import {MiniMediaConfig, MiniMediaHandler} from "../handlers/miniMediaHandler";

export class MediaOverviewComponent {
	private media: IMediaOverview;
	private config: MiniMediaConfig;
	element: HTMLDivElement = DOM.createDiv("media-overview-container");

	constructor(media: IMediaOverview, config: MiniMediaConfig) {
		this.media = media;
		this.config = config;
		this.createContent();
	}

	private createContent() {
		const content = DOM.createDiv("media-overview-content");

		if (!this.config.hideBanner && this.media.bannerImage) {
			const banner = DOM.createDiv("media-overview-banner");
			banner.style.backgroundImage = `url(${this.media.bannerImage})`;
			this.element.append(banner);
		} else {
			content.classList.add("void-media-overview-no-banner");
		}

		const leftColumn = this.createLeftColumn();
		const centerColumn = this.createCenterColumn();

		content.append(leftColumn, centerColumn);

		if (!this.config.hideTags) {
			const rightColumn = this.createRightColumn();
			content.append(rightColumn);
		}

		this.element.append(content);
	}

	private createLeftColumn(): HTMLDivElement {
		const leftColumn = DOM.createDiv("media-overview-column media-overview-left");
		if (!this.config.hideCover) {
			const poster = DOM.create<HTMLImageElement>("img", "media-overview-poster");
			poster.src = this.media.coverImage.large;
			leftColumn.append(poster);
		}

		const dataContainer = this.createData();
		leftColumn.append(dataContainer);
		return leftColumn;
	}

	private createCenterColumn(): HTMLDivElement {
		const centerColumn = DOM.createDiv("media-overview-column media-overview-center");

		const title = DOM.create("h1", null, this.media.title.userPreferred);
		if (this.media.isAdult) {
			const adultLabel = DOM.createDiv("media-overview-adult-label", "Adult");
			title.append(adultLabel);
		}
		const description = DOM.create("p");
		description.innerHTML = this.media.description;

		const collection = DOM.createDiv("media-overview-collection");

		if (this.media.relations.edges.length > 0 && !this.config.hideRelations) {
			const relations = this.createRelations();
			collection.append(relations);
		}
		if (this.media.characters.edges.length > 0 && !this.config.hideCharacters) {
			const characters = this.createCharacters();
			collection.append(characters)
		}
		if (this.media.staff.edges.length > 0 && !this.config.hideStaff) {
			const staff = this.createStaff();
			collection.append(staff);
		}

		centerColumn.append(title, description, collection);
		return centerColumn;
	}

	private createRightColumn(): HTMLDivElement {
		const rightColumn = DOM.createDiv("media-overview-column media-overview-right");
		const tags = this.createTags();
		rightColumn.append(tags);
		return rightColumn;
	}

	private createData(): HTMLDivElement {
		const dataContainer = DOM.createDiv("media-overview-data");
		dataContainer.append(this.createDataSet("Format", this.media.format.replace("_", " ").toLowerCase()));

		if (this.media.episodes)
			dataContainer.append(this.createDataSet("Episodes", this.media.episodes));
		if (this.media.chapters)
			dataContainer.append(this.createDataSet("Chapters", this.media.chapters));

		if (this.media.volumes)
			dataContainer.append(this.createDataSet("Volumes", this.media.volumes));

		if (this.media.type === "ANIME")
			dataContainer.append(this.createDataSet("Duration", this.formatDuration(this.media.duration)));

		dataContainer.append(this.createDataSet("Status", this.media.status.toLowerCase()));

		if (this.media.startDate?.year || this.media.startDate?.month || this.media.startDate?.day)
		dataContainer.append(this.createDataSet(this.media.format === "MOVIE" ? "Release Date" : "Start Date", this.formatDate(this.media.startDate)));

		if (this.media.format !== "MOVIE" && (this.media.endDate?.year || this.media.endDate?.month || this.media.endDate?.day))
			dataContainer.append(this.createDataSet("End Date", this.formatDate(this.media.endDate)));

		if (this.media.type === "ANIME"){
			dataContainer.append(this.createDataSet("Season", `${this.media.season.toLowerCase()} ${this.media.seasonYear}`));
		}

		dataContainer.append(this.createDataSet("Average Score", `${this.media.averageScore}%`));
		dataContainer.append(this.createDataSet("Mean Score", `${this.media.meanScore}%`));

		if (this.media.type === "ANIME") {
			const studios = this.media.studios.edges.filter(x => x.isMain);
			if (studios.length > 0)
				dataContainer.append(this.createDataSet("Studios", studios.map(x => x.node.name), true));

			const producers = this.media.studios.edges.filter(x => !x.isMain);
			if (producers.length > 0) {
				dataContainer.append(this.createDataSet("Producers", producers.map(x => x.node.name), true));
			}
		}

		if (this.media.source)
			dataContainer.append(this.createDataSet("Source", this.media.source.replace("_", " ").toLowerCase()));

		if (this.media.genres.length > 0)
			dataContainer.append(this.createDataSet("Genres", this.media.genres));

		if (this.media.title.romaji && this.media.title.romaji !== this.media.title.userPreferred)
			dataContainer.append(this.createDataSet("Romaji", this.media.title.romaji));

		if (this.media.title.english && this.media.title.english !== this.media.title.userPreferred)
			dataContainer.append(this.createDataSet("English", this.media.title.english));

		if (this.media.title.native && this.media.title.native !== this.media.title.userPreferred)
			dataContainer.append(this.createDataSet("Native", this.media.title.native));

		return dataContainer;
	}

	private createDataSet(typeText: string, value: any | string[], keepCapitalization = false): HTMLDivElement {
		const dataSet = DOM.createDiv("media-overview-data-set");
		const type = DOM.createDiv("media-overview-data-set-type", typeText);
		dataSet.append(type);
		const valueElement = DOM.createDiv("media-overview-data-set-value");
		if (!Array.isArray(value)) {
			valueElement.append(value);
			dataSet.append(valueElement);
		} else {
			for (const v of value) {
				const span = DOM.create("span", null, v);
				valueElement.append(span);
			}
			dataSet.append(valueElement);
		}
		if (keepCapitalization) {
			valueElement.classList.add("void-text-transform-unset");
		}
		return dataSet;
	}

	private createTags(): HTMLDivElement {
		const tagsContainer = DOM.createDiv("media-overview-tags-container");

		this.createTagElements(tagsContainer, false);

		let showSpoilers = false;

		const spoilerCount = this.media.tags.filter(x => x.isGeneralSpoiler || x.isMediaSpoiler).length;
		if (spoilerCount > 0) {
			const spoilerButton = DOM.createDiv("media-overview-tags-spoiler-btn", `Show ${spoilerCount} spoiler tags`);
			spoilerButton.addEventListener("click", () => {
				tagsContainer.replaceChildren();
				this.createTagElements(tagsContainer, !showSpoilers);
				showSpoilers = !showSpoilers;
				tagsContainer.append(spoilerButton);
			});

			tagsContainer.append(spoilerButton);
		}
		return tagsContainer;
	}

	private createTagElements(tagsContainer: HTMLDivElement, showSpoilers: boolean) {
		for (const tag of this.media.tags.sort((a, b) => {return b.rank - a.rank})) {
			const isSpoiler = tag.isMediaSpoiler || tag.isGeneralSpoiler;
			if (isSpoiler && !showSpoilers)
				continue;

			const tagElement = DOM.createDiv("media-overview-tag");
			const tagName = DOM.create("span", "media-overview-tag-name", tag.name);
			const tagRank = DOM.create("span", "media-overview-tag-rank", tag.rank + "%");
			tagElement.append(tagName, tagRank);
			tagsContainer.append(tagElement);

			if (isSpoiler) {
				tagElement.classList.add("void-media-overview-tag-spoiler");
			}
		}
	}

	private createRelations(): HTMLDivElement {
		const relationsContainer = DOM.createDiv("media-overview-horizontal-scroll-container");

		for (const relation of this.media.relations.edges) {
			const relationContainer = DOM.createDiv("media-overview-card");
			const url = `/${relation.node.type.toLowerCase()}/${relation.node.id}/`;
			const poster = DOM.createAnchor(url, "media-overview-card-cover");
			poster.style.backgroundImage = `url(${relation.node.coverImage.medium})`;
			const relationData = DOM.createDiv("media-overview-card-data");
			const relationType = DOM.createDiv("media-overview-relation-type", relation.relationType.toLowerCase());
			const relationTitle = DOM.createAnchor(url, "media-overview-relation-title", relation.node.title.userPreferred);
			const relationInfo = DOM.createDiv("media-overview-card-info", relation.node.type.toLowerCase() + " · " + relation.node.status.toLowerCase());

			poster.addEventListener("click", () => {MiniMediaHandler.hideContainer()});
			relationTitle.addEventListener("click", () => {MiniMediaHandler.hideContainer()});

			relationData.append(relationType, relationTitle, relationInfo);
			relationContainer.append(poster, relationData);
			relationsContainer.append(relationContainer);
		}
		const container = DOM.createDiv();
		const header = DOM.create("h2", "media-overview-section-header", "Relations");
		container.append(header, relationsContainer);
		return container;
	}

	private createCharacters(): HTMLDivElement {
		const charactersContainer = DOM.createDiv("media-overview-horizontal-scroll-container");

		for (const character of this.media.characters.edges.splice(0, 6)) {
			const url = `/character/${character.node.id}`;
			const characterContainer = DOM.createDiv("media-overview-card");
			const portrait = DOM.createAnchor(url, "media-overview-card-cover");
			portrait.style.backgroundImage = `url(${character.node.image.medium})`;
			const data = DOM.createDiv("media-overview-card-data media-overview-character-data");
			const characterInfo = DOM.createDiv("media-overview-card-column");
			const name = DOM.createAnchor(url, null, character.node.name.userPreferred);
			const role = DOM.createDiv("media-overview-card-info", character.role.toLowerCase());
			characterInfo.append(name, role);
			data.append(characterInfo);
			characterContainer.append(portrait, data);

			portrait.addEventListener("click", () => {MiniMediaHandler.hideContainer()});
			name.addEventListener("click", () => {MiniMediaHandler.hideContainer()});

			if (character.voiceActorRoles.length > 0) {
				const voiceActor = character.voiceActorRoles[0].voiceActor;
				const url = `/staff/${voiceActor.id}`;
				const vAInfo = DOM.createDiv("media-overview-card-column");
				const vAName = DOM.createAnchor(url, null, voiceActor.name.userPreferred);
				const vAImage = DOM.createAnchor(url, "media-overview-card-cover");
				vAImage.style.backgroundImage = `url(${voiceActor.image.medium})`;
				vAInfo.append(vAName);
				data.append(vAInfo)
				characterContainer.append(vAImage);

				vAName.addEventListener("click", () => {MiniMediaHandler.hideContainer()});
				vAImage.addEventListener("click", () => {MiniMediaHandler.hideContainer()});
			}
			charactersContainer.append(characterContainer);
		}
		const container = DOM.createDiv();
		const header = DOM.create("h2", "media-overview-section-header", "Characters");
		container.append(header, charactersContainer);
		return container;
	}

	private createStaff() {
		const staffContainer = DOM.createDiv("media-overview-horizontal-scroll-container");

		for (const staff of this.media.staff.edges.splice(0, 6)) {
			const url = `/staff/${staff.node.id}`;
			const staffElement = DOM.createDiv("media-overview-card");
			const cover = DOM.createAnchor(url, "media-overview-card-cover");
			cover.style.backgroundImage = `url(${staff.node.image.medium})`;
			const name = DOM.createAnchor(url, null, staff.node.name.userPreferred);
			const role = DOM.createDiv("media-overview-card-info", staff.role.toLowerCase());
			const data = DOM.createDiv("media-overview-card-data");
			data.append(name, role);
			staffElement.append(cover, data);
			staffContainer.append(staffElement);

			name.addEventListener("click", () => {MiniMediaHandler.hideContainer()});
			cover.addEventListener("click", () => {MiniMediaHandler.hideContainer()});
		}
		const container = DOM.createDiv();
		const header = DOM.create("h2", "media-overview-section-header", "Staff");
		container.append(header, staffContainer);
		return container;
	}

	private formatDate(date: IFuzzyDate) {
		let dateString = "";
		if (date.month) {
			const tempDate = new Date();
			tempDate.setMonth(date.month - 1);
			dateString += tempDate.toLocaleString("en-US", {month: "short"});
		}
		if (date.day) {
			dateString += ` ${date.day}`;
		}
		if (date.year) {
			dateString += `, ${date.year}`;
		}
		return dateString;
	}

	private formatDuration(duration: number) {
		if (duration === 1) {
			return duration + " min";
		}
		if (duration < 60) {
			return duration + " mins";
		}
		const hours = Math.floor(duration / 60);
		const minutes = duration % 60;
		const hoursText = hours + (hours === 1 ? " hour" : " hours");
		if (minutes === 0) {
			return hoursText;
		}
		return hoursText + " " + minutes + (minutes === 1 ? " min" : " mins");
	}
}
