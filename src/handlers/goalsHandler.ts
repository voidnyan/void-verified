import {DOM} from "../utils/DOM";
import {Button, IconButton, InputField, Label, Note, Option, Select, Tooltip} from "../components/components";
import {TrashcanIcon} from "../assets/icons";
import {AnilistAPI} from "../api/anilistAPI";
import {StaticSettings} from "../utils/staticSettings";
import {ObjectDecoder} from "../utils/objectDecoder";
import {Toaster} from "../utils/toaster";
import {Common} from "../utils/common";
import {LocalStorageKeys} from "../assets/localStorageKeys";

export interface IGoal {
	type: string,
	startAt: string,
	endAt: string,
	name: string,
	target: number,
	id?: number,
}

const goalTypes = {
	completedAnime: "Completed Anime",
	completedMovies: "Completed Movies",
	completedSeries: "Completed Series",
	watchedEpisodes: "Watched Episodes",
	watchedHours: "Hours Watched",
	completedManga: "Completed Manga",
	completedNovels: "Completed Light Novels",
	readMangaChapters: "Manga Chapters",
	readNovelChapters: "Light Novel Chapters",
	readMangaVolumes: "Manga Volumes",
	readNovelVolumes: "Light Novel Volumes"
};


const initialForm: IGoal = {
	type: "completedAnime",
	name: "",
	target: 1,
	startAt: "",
	endAt: ""
};

const localStorageKey = LocalStorageKeys.goalsConfig;

export class GoalsHandler {
	static #goalForm: IGoal = {...initialForm};
	static #goals : IGoal[];

	static initialize() {
		this.#goals = JSON.parse(localStorage.getItem(localStorageKey)) as IGoal[] ?? [] as IGoal[];
	}
	static renderSettings() {
		const container = DOM.create("div", "goals-settings");
		this.#goalForm = {...initialForm};
		this.#renderSettingsContainer(container);
		return container;
	}

	static removeGoalsContainer() {
		document.querySelector("void-goals-container")?.remove();
	}

	static async renderGoals() {
		if (!StaticSettings.options.goalsEnabled.getValue()) {
			return;
		}

		if (!Common.isOverview()) {
			return;
		}

		const username = Common.getUserNameFromUrl();

		if (!username) {
			return;
		}

		Toaster.debug("Querying user goals.");
		let goals: IGoal[];
		let media: any[];
		let mangaMedia: any[];
		const filterByDate = new Date();
		filterByDate.setDate(filterByDate.getDate() + 7);
		try {
			const anilistAPI = new AnilistAPI(StaticSettings.settingsInstance);
			const data = await anilistAPI.getUserMediaListCollection(username, "ANIME");
			const about = data.MediaListCollection.user.about;
			const json = ObjectDecoder.decodeStringToObject(about);
			goals = json?.goals;
			if (!goals) {
				return;
			}
			goals = goals.filter(x => new Date(x.endAt) > filterByDate)
			media = data.MediaListCollection.lists.map(list => list.entries).flat(1);
			if (goals?.some(goal => this.#isMangaGoal(goal.type))) {
				Toaster.debug("User has manga goals. Querying manga list.");
				const mangaData = await anilistAPI.getUserMediaListCollection(username, "MANGA");
				mangaMedia = mangaData.MediaListCollection.lists.map(list => list.entries).flat(1);
			}
		} catch (error) {
			Toaster.error("Failed to query user goals.");
			throw error;
		}

		const desktopContainer = DOM.create("div", "goals-container");

		const goalsToDisplay = goals
			.sort((a: IGoal, b: IGoal) => Common.compareDates(new Date(a.endAt), new Date(b.endAt))).slice(0, 6);

		if (goalsToDisplay.length > 0) {
			const header = DOM.create("h2", null, "Goals", {className: "section-header"})
			const container = DOM.create("div", "goals-wrap");

			for (const goal of goalsToDisplay) {
				const goalContainer = DOM.create("div");
				goalContainer.append(DOM.create("div", "goal-title", goal.name));
				const progress = this.#getGoalProgress(goal, this.#isMangaGoal(goal.type) ? mangaMedia : media)
				goalContainer.append(DOM.create("div", "goal-description", this.#getGoalDescription(goal, progress)));
				goalContainer.append(DOM.create("div", "milestones", [
					DOM.create("div", "milestone", "0"),
					DOM.create("div", "milestone", Math.floor(goal.target / 2)),
					DOM.create("div", "milestone", goal.target)
				]));
				const progressBar = DOM.create("div", "progress",
					DOM.create("div", "bar", null, {
						style: `width: ${progress / goal.target * 100}%`
					}));
				goalContainer.append(Tooltip(`Progress: ${progress}`, progressBar));
				container.append(goalContainer);
			}

			desktopContainer.append(header, container);
		}
		Common.waitToRender(".overview .section:last-child :first-child", (sibling) => {
			sibling.after(desktopContainer);
		});
	}

	static #isMangaGoal(type: string) {
		switch (type) {
			case "completedManga":
			case "completedNovels":
			case "readMangaChapters":
			case "readNovelChapters":
			case "readMangaVolumes":
			case "readNovelVolumes":
				return true;
			default:
				return false;
		}
	}

	static #getGoalDescription(goal: IGoal, progress: number) {
		const [progressDifference, scheduleDescription] = this.#getSchedule(goal, progress);
		switch (goal.type) {
			case "completedAnime":
				return `Watch ${goal.target} anime by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} anime ${scheduleDescription}.`;
			case "completedMovies":
				return `Watch ${goal.target} movies by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} movies ${scheduleDescription}.`;
				break;
			case "completedSeries":
				return `Watch ${goal.target} series by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} series ${scheduleDescription}.`;
			case "watchedEpisodes":
				return `Watch ${goal.target} episodes by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} episodes ${scheduleDescription}.`;
			case "watchedHours":
				return `Watch ${goal.target} hours by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} hours ${scheduleDescription}.`;
			case "completedManga":
				return `Complete ${goal.target} manga by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} manga ${scheduleDescription}.`;
			case "completedNovels":
				return `Complete ${goal.target} light novels by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} light novels ${scheduleDescription}.`;
			case "readMangaChapters":
				return `Read ${goal.target} chapters of manga by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} chapters ${scheduleDescription}.`;
			case "readNovelChapters":
				return `Read ${goal.target} chapters of light novels by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} chapters ${scheduleDescription}.`;
			case "readMangaVolumes":
				return `Read ${goal.target} volumes of manga by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} volumes ${scheduleDescription}.`;
			case "readNovelVolumes":
				return `Read ${goal.target} volumes of light novels by ${new Date(goal.endAt).toDateString()}.
				You are ${progressDifference} volumes ${scheduleDescription}.`;
		}
	}

	static #getSchedule(goal: IGoal, progress: number) {
		const goalStart = new Date(goal.startAt);
		const goalEnd = new Date(goal.endAt);
		const dayDifference = Common.getDayDifference(goalStart, goalEnd);
		const desiredDailyProgress = goal.target / dayDifference;
		const currentDate = new Date();
		const currentDayDifference = Common.getDayDifference(goalStart, currentDate > goalEnd ? goalEnd : currentDate);
		const desiredCurrentProgress = Math.floor(desiredDailyProgress * currentDayDifference);

		return [progress < desiredCurrentProgress ? desiredCurrentProgress - progress : progress - desiredCurrentProgress,
			progress < desiredCurrentProgress ? "behind schedule" : "ahead of schedule"];
	}

	static #getGoalProgress(goal: IGoal, media) {
		let mediaCopy = [...media];
		switch (goal.type) {
			case "completedAnime":
				break;
			case "completedMovies":
				mediaCopy = mediaCopy.filter(entry => entry.media.format === "MOVIE");
				break;
			case "completedSeries":
			case "watchedEpisodes":
				mediaCopy = mediaCopy.filter(entry => entry.media.format === "TV" || entry.media.format === "TV_SHORT"
					|| entry.media.format === "OVA" || entry.media.format === "ONA");
				break;
			case "watchedHours":
				break;
			case "completedManga":
			case "readMangaChapters":
			case "readMangaVolumes":
				mediaCopy = mediaCopy.filter(entry => entry.media.format === "MANGA" || entry.media.format === "ONE_SHOT");
				break;
			case "completedNovels":
			case "readNovelChapters":
			case "readNovelVolumes":
				mediaCopy = mediaCopy.filter(entry => entry.media.format === "NOVEL");
				break;
		}
		const progress = this.#calculateGoalProgress(goal, mediaCopy);
		return progress;
	}

	static #calculateGoalProgress(goal: IGoal, media) {
		let progress = 0;
		const goalStart = new Date(goal.startAt);
		const goalEnd = new Date(goal.endAt);
		switch (goal.type) {
			case "watchedEpisodes":
			case "readMangaChapters":
			case "readNovelChapters":
				for (const entry of media) {
					const completedAt = new Date(`${entry.completedAt.year}-${entry.completedAt.month}-${entry.completedAt.day}`);
					const startedAt = new Date(`${entry.startedAt.year}-${entry.startedAt.month}-${entry.startedAt.day}`);
					if ((goalStart <= completedAt && goalEnd >= completedAt) ||
						(goalStart <= startedAt && goalEnd >= startedAt)) {
						progress += entry.progress;
					}
				}
				break;
			case "readMangaVolumes":
			case "readNovelVolumes":
				for (const entry of media) {
					const completedAt = new Date(`${entry.completedAt.year}-${entry.completedAt.month}-${entry.completedAt.day}`);
					const startedAt = new Date(`${entry.startedAt.year}-${entry.startedAt.month}-${entry.startedAt.day}`);
					if ((goalStart <= completedAt && goalEnd >= completedAt) ||
						(goalStart <= startedAt && goalEnd >= startedAt)) {
						progress += entry.progressVolumes;
					}
				}
				break;
			case "watchedHours":
				for (const entry of media) {
					const completedAt = new Date(`${entry.completedAt.year}-${entry.completedAt.month}-${entry.completedAt.day}`);
					const startedAt = new Date(`${entry.startedAt.year}-${entry.startedAt.month}-${entry.startedAt.day}`);
					if ((goalStart <= completedAt && goalEnd >= completedAt) ||
						(goalStart <= startedAt && goalEnd >= startedAt)) {
						progress += entry.media.duration * entry.progress;
					}
				}
				return Math.floor(progress / 60);
				break;
			default:
				for (const entry of media) {
					const completedAt = new Date(`${entry.completedAt.year}-${entry.completedAt.month}-${entry.completedAt.day}`);
					if (goalStart <= completedAt && goalEnd >= completedAt) {
						progress++;
					}
				}
		}

		return progress;
	}

	static #renderSettingsContainer(container: HTMLElement) {
		container.replaceChildren();
		const header = DOM.create("h3", null, "Goals");
		container.append(header);
		container.append(DOM.create("p", null, "Your goals will be visible on your profile overview. " +
			"They will be ordered by their end date. Only the first six goals will be visible. " +
			"Goals will be visible for seven days after their end date."))
		container.append(this.#renderForm());
		container.append(this.#renderSettingsGoalsList());
		const saveButton = Button("Save", async function() {
			await this.#saveGoals();
		}.bind(this), "success");
		container.append(saveButton);
		const fetchButton = Button("Fetch current", async function() {
			await this.#fetchGoals();
			this.#renderSettingsContainer(container);
		}.bind(this));
		container.append(fetchButton);

		container.append(Note("Please note that AniList doesn't provide a perfect history. " +
			"VoidVerified does it's best to guesstimate the goal progress for you. " +
			"This is done by checking the end dates of your list entries. Some goal types also use start date."));
	}

	static #renderSettingsGoalsList() {
		const container = DOM.create("table", "table w-100");
		const tableHeader = DOM.create("tr", null, [
			DOM.create("th", null, "Name"),
			DOM.create("th", null, "Type"),
			DOM.create("th", null, "Start"),
			DOM.create("th", null, "End"),
			DOM.create("th", null, "Target"),
			DOM.create("th", null, "")
		]);
		container.append(DOM.create("thead", null, tableHeader));
		const body = DOM.create("tbody");
		for (const goal of this.#goals) {
			const row = DOM.create("tr", null, [
				DOM.create("td", null, goal.name),
				DOM.create("td", null, goalTypes[goal.type]),
				DOM.create("td", null, goal.startAt),
				DOM.create("td", null, goal.endAt),
				DOM.create("td", null, goal.target),
				DOM.create("td", null, IconButton(TrashcanIcon(), () => {
					this.#goals = this.#goals.filter(g => g.id !== goal.id);
					localStorage.setItem(localStorageKey, JSON.stringify(this.#goals));
					this.#renderSettingsContainer(container.parentElement);
				}))
			]);
			body.append(row);
		}
		container.append(body)
		return container;
	}

	static #renderForm() {
		const container = DOM.create("div", "goal-form");
		container.append(Label("Name", InputField(this.#goalForm.name, (event) => {
			this.#goalForm.name = event.target.value;
		}, null, {
			maxlength: 60,
			type: "text"
		})));
		container.append(Label("Target", InputField(this.#goalForm.target, (event) => {
			this.#goalForm.target = event.target.value;
		}, null, {
			type: "number",
			min: 1
		})));

		container.append(Label("Start", InputField(this.#goalForm.startAt, (event) => {
			this.#goalForm.startAt = event.target.value;
		}, null, {
			type: "date"
		})));

		container.append(Label("End", InputField(this.#goalForm.endAt, (event) => {
			this.#goalForm.endAt = event.target.value;
		}, null, {
			type: "date"
		})));

		const typeOptions = Object.entries(goalTypes).map(([key, value]) => Option(value, key === this.#goalForm.type, () => {
			this.#goalForm.type = key;
			this.#renderSettingsContainer(container.parentElement);
		}));
		container.append(Label("Type", Select(typeOptions)));
		container.append(Button("Add Goal", () => {
			if (this.#validateGoal(this.#goalForm)) {
				return;
			}
			this.#goals.push({
				...this.#goalForm,
				id: Math.random()
			});
			localStorage.setItem(localStorageKey, JSON.stringify(this.#goals));
			this.#goalForm = {...initialForm};
			this.#renderSettingsContainer(container.parentElement);
		}));
		return container;
	}

	static #validateGoal(goal: IGoal) {
		let hasErrors = false;

		if (goal.name === "") {
			Toaster.critical("Goal name is missing.");
			hasErrors = true;
		}
		if (goal.startAt === "") {
			Toaster.critical("Goal start date is missing.");
			hasErrors = true;
		}
		if (goal.endAt === "") {
			Toaster.critical("Goal end date is missing.");
			hasErrors = true;
		}

		if (new Date(goal.startAt) > new Date(goal.endAt)) {
			Toaster.critical("Start date after end date.");
			hasErrors = true;
		}

		return hasErrors;
	}

	static async #saveGoals() {
		const anilistAPI = new AnilistAPI(StaticSettings.settingsInstance);

		try {
			Toaster.debug("Querying API for bio and saving goals.");
			const about = await anilistAPI.getUserAbout(StaticSettings.settingsInstance.anilistUser);
			const aboutJson = ObjectDecoder.decodeStringToObject(about);
			aboutJson.goals = this.#goals;
			const newAbout = ObjectDecoder.insertJsonToUserBio(about, aboutJson);
			await anilistAPI.saveUserAbout(newAbout);
			Toaster.success("Saved goals.");
		} catch (error) {
			Toaster.error("Failed to save goals.");
			throw error;
		}
	}

	static async #fetchGoals(){
		const anilistAPI = new AnilistAPI(StaticSettings.settingsInstance);

		try {
			Toaster.debug("Fetching goals.");
			const about = await anilistAPI.getUserAbout(StaticSettings.settingsInstance.anilistUser);
			const aboutJson = ObjectDecoder.decodeStringToObject(about);
			if (aboutJson.goals) {
				this.#goals = aboutJson.goals;
				localStorage.setItem(localStorageKey, JSON.stringify(this.#goals));
				Toaster.success("Fetched goals,")
			} else {
				Toaster.success("You had no goals saved.");
			}
		} catch (error) {
			Toaster.error("Failed to fetch goals.");
			throw error;
		}
	}
}
