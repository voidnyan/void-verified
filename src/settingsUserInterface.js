import { ColorFunctions } from "./colorFunctions";

export class SettingsUserInterface {
	settings;
	styleHandler;
	globalCSS;
	AnilistBlue = "120, 180, 255";

	constructor(settings, styleHandler, globalCSS) {
		this.settings = settings;
		this.styleHandler = styleHandler;
		this.globalCSS = globalCSS;
	}

	renderSettingsUi() {
		const container = document.querySelector(
			".settings.container > .content"
		);
		const settingsContainer = document.createElement("div");
		settingsContainer.setAttribute("id", "voidverified-settings");
		this.#renderSettingsHeader(settingsContainer);

		const settingsListContainer = document.createElement("div");
		settingsListContainer.style.display = "flex";
		settingsListContainer.style.flexDirection = "column";
		settingsListContainer.style.gap = "5px";
		for (const [key, setting] of Object.entries(this.settings.options)) {
			this.#renderSetting(setting, settingsListContainer, key);
		}

		settingsContainer.append(settingsListContainer);

		this.#renderUserTable(settingsContainer);

		this.#renderCustomCssEditor(settingsContainer);

		container.append(settingsContainer);
	}

	removeSettingsUi() {
		const settings = document.querySelector("#voidverified-settings");
		settings?.remove();
	}

	#renderSettingsHeader(settingsContainer) {
		const headerContainer = document.createElement("div");
		const header = document.createElement("h1");
		header.style.marginTop = "30px";
		header.innerText = "VoidVerified settings";

		const versionInfo = document.createElement("p");
		versionInfo.append("version: ");
		const versionNumber = document.createElement("span");
		versionNumber.style.color = `rgb(${this.AnilistBlue})`;
		versionNumber.append(this.settings.version);

		versionInfo.append(versionNumber);

		headerContainer.append(header);
		headerContainer.append(versionInfo);
		settingsContainer.append(headerContainer);
	}

	#renderUserTable(settingsContainer) {
		const oldTableContainer = document.querySelector(
			"#void-verified-user-table"
		);
		const tableContainer =
			oldTableContainer ?? document.createElement("div");
		tableContainer.innerHTML = "";

		tableContainer.setAttribute("id", "void-verified-user-table");

		const table = document.createElement("table");
		const head = document.createElement("thead");
		const headrow = document.createElement("tr");
		headrow.append(this.#createCell("Username", "th"));
		headrow.append(this.#createCell("Sign", "th"));
		headrow.append(this.#createCell("Color", "th"));
		headrow.append(this.#createCell("Other", "th"));

		head.append(headrow);

		const body = document.createElement("tbody");

		for (const user of this.settings.verifiedUsers) {
			body.append(this.#createUserRow(user));
		}

		table.append(head);
		table.append(body);
		tableContainer.append(table);

		const inputForm = document.createElement("form");
		inputForm.addEventListener("submit", (event) =>
			this.#handleVerifyUserForm(event, this.settings)
		);
		const label = document.createElement("label");
		label.innerText = "Add user";
		inputForm.append(label);
		const textInput = document.createElement("input");
		textInput.setAttribute("id", "voidverified-add-user");

		inputForm.append(textInput);
		tableContainer.append(inputForm);

		oldTableContainer || settingsContainer.append(tableContainer);
	}

	#createUserRow(user) {
		const row = document.createElement("tr");
		const userLink = document.createElement("a");
		userLink.innerText = user.username;
		userLink.setAttribute(
			"href",
			`https://anilist.co/user/${user.username}/`
		);
		userLink.setAttribute("target", "_blank");
		row.append(this.#createCell(userLink));

		const signInput = document.createElement("input");
		signInput.value = user.sign ?? "";
		signInput.style.width = "100px";
		signInput.addEventListener("input", (event) =>
			this.#updateUserOption(user.username, "sign", event.target.value)
		);
		const signCell = this.#createCell(signInput);
		signCell.append(
			this.#createUserCheckbox(
				user.enabledForUsername,
				user.username,
				"enabledForUsername",
				this.settings.options.enabledForUsername.getValue()
			)
		);

		row.append(this.#createCell(signCell));

		const colorInput = document.createElement("input");
		colorInput.setAttribute("type", "color");
		colorInput.style.border = "0";
		colorInput.style.height = "24px";
		colorInput.style.width = "40px";
		colorInput.style.padding = "0";
		colorInput.style.backgroundColor = "unset";
		colorInput.value = this.#getUserColorPickerColor(user);
		colorInput.addEventListener(
			"change",
			(event) => this.#handleUserColorChange(event, user.username),
			false
		);

		const colorInputContainer = document.createElement("span");

		const colorCell = this.#createCell(colorInput);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.copyColorFromProfile,
				user.username,
				"copyColorFromProfile",
				this.settings.options.copyColorFromProfile.getValue()
			)
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.highlightEnabled,
				user.username,
				"highlightEnabled",
				this.settings.options.highlightEnabled.getValue()
			)
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.highlightEnabledForReplies,
				user.username,
				"highlightEnabledForReplies",
				this.settings.options.highlightEnabledForReplies.getValue()
			)
		);

		colorCell.append(colorInputContainer);

		const resetColorBtn = document.createElement("button");
		resetColorBtn.innerText = "🔄";
		resetColorBtn.addEventListener("click", () =>
			this.#handleUserColorReset(user.username)
		);

		colorCell.append(resetColorBtn);
		row.append(colorCell);

		const quickAccessCheckbox = this.#createUserCheckbox(
			user.quickAccessEnabled,
			user.username,
			"quickAccessEnabled",
			this.settings.options.quickAccessEnabled.getValue()
		);
		row.append(this.#createCell(quickAccessCheckbox));

		const deleteButton = document.createElement("button");
		deleteButton.innerText = "❌";
		deleteButton.addEventListener("click", () =>
			this.#removeUser(user.username)
		);
		row.append(this.#createCell(deleteButton));
		return row;
	}

	#getUserColorPickerColor(user) {
		if (user.colorOverride) {
			return user.colorOverride;
		}

		if (
			user.color &&
			(user.copyColorFromProfile ||
				this.settings.options.copyColorFromProfile.getValue())
		) {
			return ColorFunctions.rgbToHex(user.color);
		}

		if (this.settings.options.useDefaultHighlightColor.getValue()) {
			return this.settings.options.defaultHighlightColor.getValue();
		}

		return ColorFunctions.rgbToHex(this.AnilistBlue);
	}

	#createUserCheckbox(isChecked, username, settingKey, disabled) {
		const checkbox = document.createElement("input");
		if (disabled) {
			checkbox.setAttribute("disabled", "");
		}

		checkbox.setAttribute("type", "checkbox");
		checkbox.checked = isChecked;
		checkbox.addEventListener("change", (event) => {
			this.#updateUserOption(username, settingKey, event.target.checked);
			this.#refreshUserTable();
		});

		checkbox.style.marginLeft = "5px";

		checkbox.title = this.settings.options[settingKey].description;
		return checkbox;
	}

	#handleUserColorReset(username) {
		this.#updateUserOption(username, "colorOverride", undefined);
		this.#refreshUserTable();
	}

	#handleUserColorChange(event, username) {
		const color = event.target.value;
		this.#updateUserOption(username, "colorOverride", color);
	}

	#handleVerifyUserForm(event, settings) {
		event.preventDefault();

		const usernameInput = document.getElementById("voidverified-add-user");
		const username = usernameInput.value;
		settings.verifyUser(username);
		usernameInput.value = "";
		this.#refreshUserTable();
	}

	#refreshUserTable() {
		const container = document.querySelector(
			".settings.container > .content"
		);
		this.#renderUserTable(container);
	}

	#updateUserOption(username, key, value) {
		this.settings.updateUserOption(username, key, value);
		this.styleHandler.refreshStyles();
	}

	#removeUser(username) {
		this.settings.removeUser(username);
		this.#refreshUserTable();
		this.styleHandler.refreshStyles();
	}

	#createCell(content, elementType = "td") {
		const cell = document.createElement(elementType);
		cell.append(content);
		return cell;
	}

	#renderSetting(setting, settingsContainer, settingKey, disabled = false) {
		const value = setting.getValue();
		const type = typeof value;

		const container = document.createElement("div");
		const input = document.createElement("input");

		if (type === "boolean") {
			input.setAttribute("type", "checkbox");
		} else if (settingKey == "defaultHighlightColor") {
			input.setAttribute("type", "color");
			input.style.border = "0";
			input.style.height = "15px";
			input.style.width = "25px";
			input.style.padding = "0";
			input.style.backgroundColor = "unset";
		} else if (type === "string") {
			input.setAttribute("type", "text");
			input.style.width = "50px";
		}

		if (disabled) {
			input.setAttribute("disabled", "");
		}

		input.setAttribute("id", settingKey);
		input.addEventListener("change", (event) =>
			this.#handleOption(event, settingKey, type)
		);

		if (type === "boolean" && value) {
			input.setAttribute("checked", true);
		} else if (type === "string") {
			input.value = value;
		}

		container.append(input);

		const label = document.createElement("label");
		label.setAttribute("for", settingKey);
		label.innerText = setting.description;
		label.style.marginLeft = "5px";
		container.append(label);
		settingsContainer.append(container);
	}

	#handleOption(event, settingKey, type) {
		const value =
			type === "boolean" ? event.target.checked : event.target.value;
		this.settings.saveSettingToLocalStorage(settingKey, value);
		this.styleHandler.refreshStyles();
		this.#refreshUserTable();
	}

	#renderCustomCssEditor(settingsContainer) {
		const container = document.createElement("div");
		const label = document.createElement("label");
		label.innerText = "Custom Global CSS";
		label.setAttribute("for", "void-verified-global-css-editor");
		label.style.marginTop = "20px";
		label.style.fontSize = "2rem";
		label.style.display = "inline-block";
		container.append(label);

		const textarea = document.createElement("textarea");
		textarea.setAttribute("id", "void-verified-global-css-editor");

		textarea.value = this.globalCSS.css;
		textarea.style.width = "100%";
		textarea.style.height = "200px";
		textarea.style.resize = "vertical";
		textarea.style.background = "#14191f";
		textarea.style.color = "white";

		textarea.addEventListener("change", (event) => {
			this.#handleCustomCssEditor(event, this);
		});

		container.append(textarea);

		const notice = document.createElement("div");
		notice.innerText =
			"Please note that Custom CSS is disabled in the settings. \nIn the event that you accidentally disable rendering of critical parts of AniList, navigate to the settings by URL";
		notice.style.fontSize = "11px";
		container.append(notice);

		settingsContainer.append(container);
	}

	#handleCustomCssEditor(event, settingsUi) {
		const value = event.target.value;
		settingsUi.globalCSS.updateCss(value);
	}
}
