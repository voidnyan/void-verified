import {DOM} from "./DOM";
import {Checkbox, IconButton, InputField, Table, TableBody, TableHead, Tooltip} from "../components/components";
import {IVerifiedUser} from "../types/settings";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {StaticSettings} from "./staticSettings";
import {RefreshIcon} from "../assets/icons";
import {ColorFunctions} from "./colorFunctions";
import {StyleHandler} from "../handlers/styleHandler";
import {IUser} from "../api/types/user";
import {Toaster} from "./toaster";
import {AnilistAPI} from "../api/anilistAPI";

export class VerifiedUsers {
	static users: IVerifiedUser[] = [];
	static tableContainer;

	static initialize() {
		this.users =
			JSON.parse(localStorage.getItem(LocalStorageKeys.verifiedUSers)) ?? [];
	}

	static createUserTable(): HTMLDivElement {
		this.tableContainer = DOM.create("div", "table #verified-user-table");

		this.renderUserTable();

		return this.tableContainer;
	}

	private static renderUserTable() {
		this.tableContainer.replaceChildren();
		this.tableContainer.style = `
            margin-top: 25px;
        `;
		const head = TableHead("Username", "Sign", "Color", "Other");

		const rows = this.users.map((user) =>
			this.createUserRow(user),
		);
		const body = TableBody(rows);

		const table = Table(head, body);
		this.tableContainer.append(table);

		const inputForm = DOM.create("form");

		inputForm.addEventListener("submit", (event) => {
			this.#handleVerifyUserForm(event);
		});

		const inputFormLabel = DOM.create("label", null, "Add user");
		inputFormLabel.setAttribute("for", "void-verified-add-user");

		inputForm.append(inputFormLabel);
		inputForm.append(InputField("", () => {
		}, "#verified-add-user"));
		this.tableContainer.append(inputForm);
	}

	private static createUserRow(user: IVerifiedUser) {
		const row = DOM.create("tr");
		const userLink = DOM.create("a", null, user.username);
		userLink.setAttribute(
			"href",
			`/user/${user.username}/`,
		);
		userLink.setAttribute("target", "_blank");
		row.append(DOM.create("td", null, userLink));

		const signInput = InputField(
			user.sign ?? "",
			(event) => {
				this.#updateUserOption(
					user.username,
					"sign",
					event.target.value,
				);
			},
			"sign",
		);

		const signCell = DOM.create("td", null, signInput);
		signCell.append(
			this.#createUserCheckbox(
				user.enabledForUsername,
				user.username,
				"enabledForUsername",
				StaticSettings.options.enabledForUsername.getValue() as boolean,
			),
		);

		row.append(DOM.create("th", null, signCell));

		const colorInputContainer = DOM.create("div");

		const colorInput = DOM.create<HTMLInputElement>("input");
		colorInput.setAttribute("type", "color");
		colorInput.value = this.#getUserColorPickerColor(user);
		colorInput.addEventListener(
			"change",
			(event) => this.#handleUserColorChange(event, user.username),
			false,
		);

		colorInputContainer.append(colorInput);

		colorInputContainer.append(
			IconButton(RefreshIcon(), () => {
				this.#handleUserColorReset(user.username);
			}),
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.copyColorFromProfile,
				user.username,
				"copyColorFromProfile",
				StaticSettings.options.copyColorFromProfile.getValue() as boolean,
			),
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.highlightEnabled,
				user.username,
				"highlightEnabled",
				StaticSettings.options.highlightEnabled.getValue() as boolean,
			),
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.highlightEnabledForReplies,
				user.username,
				"highlightEnabledForReplies",
				StaticSettings.options.highlightEnabledForReplies.getValue() as boolean,
			),
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.colorUserActivity,
				user.username,
				"colorUserActivity",
				StaticSettings.options.colorUserActivity.getValue() as boolean,
			),
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.colorUserReplies,
				user.username,
				"colorUserReplies",
				StaticSettings.options.colorUserReplies.getValue() as boolean,
			),
		);

		const colorCell = DOM.create("td", null, colorInputContainer);
		row.append(colorCell);

		const quickAccessCheckbox = this.#createUserCheckbox(
			user.quickAccessEnabled,
			user.username,
			"quickAccessEnabled",
			StaticSettings.options.quickAccessEnabled.getValue() as boolean,
		);

		const otherCell = DOM.create("td", null, quickAccessCheckbox);
		row.append(otherCell);

		const deleteButton = DOM.create("button", null, "❌");
		deleteButton.addEventListener("click", () =>
			this.#removeUser(user.username),
		);
		row.append(DOM.create("th", null, deleteButton));
		return row;
	}


	static #getUserColorPickerColor(user) {
		if (user.colorOverride) {
			return user.colorOverride;
		}

		if (
			user.color &&
			(user.copyColorFromProfile ||
				StaticSettings.options.copyColorFromProfile.getValue())
		) {
			return ColorFunctions.rgbToHex(user.color);
		}

		if (StaticSettings.options.useDefaultHighlightColor.getValue()) {
			return StaticSettings.options.defaultHighlightColor.getValue();
		}

		return ColorFunctions.rgbToHex(ColorFunctions.anilistBlue);
	}


	static #createUserCheckbox(isChecked: boolean, username: string, settingKey: string, disabled: boolean) {
		const onChange = (event) => {
			this.#updateUserOption(username, settingKey, event.target.checked);
			this.renderUserTable();
		};
		const description = StaticSettings.options[settingKey].description;
		const checkbox = Checkbox(isChecked, onChange, disabled);
		return Tooltip(description, checkbox);
	}

	static #handleUserColorReset(username) {
		this.#updateUserOption(username, "colorOverride", undefined);
		this.renderUserTable();
	}

	static #handleUserColorChange(event, username) {
		const color = event.target.value;
		this.#updateUserOption(username, "colorOverride", color);
	}

	static async #handleVerifyUserForm(event: Event) {
		event.preventDefault();

		const usernameInput = DOM.get("#verified-add-user") as HTMLInputElement;
		const username = usernameInput.value;
		console.log(username);
		await this.verifyUser(username);
		usernameInput.value = "";
		this.renderUserTable();
	}

	static #updateUserOption(username, key, value) {
		this.updateUserOption(username, key, value);
		new StyleHandler(StaticSettings.settingsInstance).refreshStyles();
	}

	static #removeUser(username) {
		this.removeUser(username);
		this.renderUserTable();
		new StyleHandler(StaticSettings.settingsInstance).refreshStyles();
	}

	static updateUserOption(username: string, key: string, value: any) {
		this.users = this.users.map((u) =>
			u.username === username
				? {
					...u,
					[key]: value,
				}
				: u,
		);
		localStorage.setItem(
			LocalStorageKeys.verifiedUSers,
			JSON.stringify(this.users),
		);
	}

	static updateUserFromApi(apiUser: IUser) {
		let user = this.findUser(apiUser);

		if (!user) {
			return;
		}

		const newUser = this.mapApiUser(user, apiUser);
		this.mapVerifiedUsers(newUser);

		localStorage.setItem(
			LocalStorageKeys.verifiedUSers,
			JSON.stringify(this.users),
		);
	}

	static findUser(apiUser: IUser): IVerifiedUser {
		let user = this.users.find((u) => u.id && u.id === apiUser.id);

		if (user) {
			return user;
		}

		return this.users.find(
			(u) => u.username.toLowerCase() === apiUser.name.toLowerCase(),
		);
	}

	static mapApiUser(user: IVerifiedUser, apiUser: IUser) {
		let userObject: IVerifiedUser = {...user};

		userObject.color = ColorFunctions.handleAnilistColor(
			apiUser.options.profileColor,
		);

		userObject.username = apiUser.name;
		userObject.avatar = apiUser.avatar.large;
		userObject.banner = apiUser.bannerImage;
		userObject.id = apiUser.id;
		userObject.lastFetch = new Date();

		if (StaticSettings.options.quickAccessBadge.getValue() || user.quickAccessBadge) {
			if (
				(user.avatar && user.avatar !== userObject.avatar) ||
				(user.color && user.color !== userObject.color) ||
				(user.banner && user.banner !== userObject.banner) ||
				(user.username &&
					user.username.toLowerCase() !==
					userObject.username.toLowerCase())
			) {
				userObject.quickAccessBadgeDisplay = true;
			}
		}

		return userObject;
	}

	static mapVerifiedUsers(newUser: IVerifiedUser) {
		if (this.users.find((u) => u.id && u.id === newUser.id)) {
			this.users = this.users.map((u) =>
				u.id === newUser.id ? newUser : u,
			);
			return;
		}
		this.users = this.users.map((u) =>
			u.username.toLowerCase() === newUser.username.toLowerCase()
				? newUser
				: u,
		);
	}

	static removeUser(username: string) {
		this.users = this.users.filter(
			(user) => user.username !== username,
		);
		localStorage.setItem(
			LocalStorageKeys.verifiedUSers,
			JSON.stringify(this.users),
		);
	}

	static async verifyUser(username: string) {
		if (
			this.users.find(
				(user) =>
					user.username.toLowerCase() === username.toLowerCase(),
			)
		) {
			return;
		}

		try {
			Toaster.debug(`Querying ${username}.`);
			const user = await AnilistAPI.queryUser(username);
			// TODO: refactor updateUserFromApi to not need this user already saved
			this.users.push({
				username,
				avatar: "",
				banner: "",
				color: ColorFunctions.anilistBlue,
				colorUserActivity: false,
				colorUserReplies: false,
				copyColorFromProfile: false,
				enabledForUsername: false,
				highlightEnabled: false,
				highlightEnabledForReplies: false,
				id: undefined,
				lastFetch: new Date(),
				quickAccessBadge: false,
				quickAccessBadgeDisplay: false,
				quickAccessEnabled: false,
				sign: undefined
			});
			this.updateUserFromApi(user);
		} catch (error) {
			Toaster.error("Failed to query new user.", error);
		}
	}
}
