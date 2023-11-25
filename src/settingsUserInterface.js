import { ImageApiFactory } from "./api/imageApiFactory";
import { imageHosts, ImageHostService } from "./api/imageHostConfiguration";
import { ColorFunctions } from "./colorFunctions";
import { categories } from "./defaultSettings";

export class SettingsUserInterface {
	settings;
	styleHandler;
	globalCSS;
	AnilistBlue = "120, 180, 255";
	#activeCategory = "all";

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
		settingsContainer.setAttribute("class", "void-settings");
		this.#renderSettingsHeader(settingsContainer);

		this.#renderCategories(settingsContainer);
		this.#renderOptions(settingsContainer);
		this.#renderUserTable(settingsContainer);
		this.#renderCustomCssEditor(settingsContainer);

		const imageHostContainer = document.createElement("div");
		imageHostContainer.setAttribute("id", "void-verified-image-host");
		settingsContainer.append(imageHostContainer);

		this.#renderImageHostSettings(imageHostContainer);

		container.append(settingsContainer);
	}

	#renderOptions(settingsContainer) {
		const oldSettingsListContainer =
			document.getElementById("void-settings-list");
		const settingsListContainer =
			oldSettingsListContainer ?? document.createElement("div");
		settingsListContainer.innerHTML = "";
		settingsListContainer.setAttribute("id", "void-settings-list");
		settingsListContainer.setAttribute("class", "void-settings-list");

		for (const [key, setting] of Object.entries(this.settings.options)) {
			if (
				setting.category !== this.#activeCategory &&
				this.#activeCategory !== "all"
			) {
				continue;
			}
			this.#renderSetting(setting, settingsListContainer, key);
		}

		oldSettingsListContainer ??
			settingsContainer.append(settingsListContainer);
	}

	removeSettingsUi() {
		const settings = document.querySelector("#voidverified-settings");
		settings?.remove();
	}

	#renderSettingsHeader(settingsContainer) {
		const headerContainer = document.createElement("div");
		headerContainer.setAttribute("class", "void-settings-header");
		const header = document.createElement("h1");
		header.innerText = "VoidVerified settings";

		const versionInfo = document.createElement("p");
		versionInfo.append("Version: ");
		const versionNumber = document.createElement("span");
		versionNumber.append(this.settings.version);

		versionInfo.append(versionNumber);

		headerContainer.append(header);
		headerContainer.append(versionInfo);
		settingsContainer.append(headerContainer);
	}

	#renderCategories(settingsContainer) {
		const oldNav = document.querySelector(".void-nav");
		const nav = oldNav ?? document.createElement("nav");

		nav.innerHTML = "";

		nav.setAttribute("class", "void-nav");
		const list = document.createElement("ol");

		list.append(this.#createNavBtn("all"));

		for (const category of Object.values(categories)) {
			list.append(this.#createNavBtn(category));
		}

		nav.append(list);
		oldNav ?? settingsContainer.append(nav);
	}

	#createNavBtn(category) {
		const li = document.createElement("li");
		li.append(category);
		if (category === this.#activeCategory) {
			li.setAttribute("class", "void-active");
		}

		li.addEventListener("click", () => {
			this.#activeCategory = category;
			this.#renderCategories();
			this.#renderOptions();
		});

		return li;
	}

	#renderUserTable(settingsContainer) {
		const oldTableContainer = document.querySelector(
			"#void-verified-user-table"
		);
		const tableContainer =
			oldTableContainer ?? document.createElement("div");
		tableContainer.innerHTML = "";
		tableContainer.setAttribute("class", "void-table");

		tableContainer.setAttribute("id", "void-verified-user-table");

		tableContainer.style = `
            margin-top: 25px;
        `;

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
		signInput.setAttribute("type", "text");
		signInput.value = user.sign ?? "";
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

		const colorInputContainer = document.createElement("div");

		const colorInput = document.createElement("input");
		colorInput.setAttribute("type", "color");
		colorInput.value = this.#getUserColorPickerColor(user);
		colorInput.addEventListener(
			"change",
			(event) => this.#handleUserColorChange(event, user.username),
			false
		);

		colorInputContainer.append(colorInput);

		const resetColorBtn = document.createElement("button");
		resetColorBtn.innerText = "🔄";
		resetColorBtn.addEventListener("click", () =>
			this.#handleUserColorReset(user.username)
		);

		colorInputContainer.append(resetColorBtn);

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

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.colorUserActivity,
				user.username,
				"colorUserActivity",
				this.settings.options.colorUserActivity.getValue()
			)
		);

		colorInputContainer.append(
			this.#createUserCheckbox(
				user.colorUserReplies,
				user.username,
				"colorUserReplies",
				this.settings.options.colorUserReplies.getValue()
			)
		);

		const colorCell = this.#createCell(colorInputContainer);
		row.append(colorCell);

		const quickAccessCheckbox = this.#createUserCheckbox(
			user.quickAccessEnabled,
			user.username,
			"quickAccessEnabled",
			this.settings.options.quickAccessEnabled.getValue()
		);

		const otherCell = this.#createCell(quickAccessCheckbox);

		const cssEnabledCheckbox = this.#createUserCheckbox(
			user.onlyLoadCssFromVerifiedUser,
			user.username,
			"onlyLoadCssFromVerifiedUser",
			this.settings.options.onlyLoadCssFromVerifiedUser.getValue()
		);

		otherCell.append(cssEnabledCheckbox);

		row.append(otherCell);

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
		} else if (type === "string") {
			input.setAttribute("type", "text");
		}

		if (disabled) {
			input.setAttribute("disabled", "");
		}

		input.setAttribute("id", settingKey);

		if (settingKey === "pasteKeybind") {
			input.style.width = "80px";
			input.addEventListener("keydown", (event) =>
				this.#handleKeybind(event, settingKey, input)
			);
		} else {
			input.addEventListener("change", (event) =>
				this.#handleOption(event, settingKey, type)
			);
		}

		if (type === "boolean" && value) {
			input.setAttribute("checked", true);
		} else if (type === "string") {
			input.value = value;
		}

		container.append(input);

		const label = document.createElement("label");
		label.setAttribute("for", settingKey);
		label.innerText = setting.description;
		container.append(label);
		settingsContainer.append(container);
	}

	#handleKeybind(event, settingKey, input) {
		event.preventDefault();
		const keybind = event.key;
		this.settings.saveSettingToLocalStorage(settingKey, keybind);
		input.value = keybind;
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
		container.setAttribute("class", "void-css-editor");
		const label = document.createElement("label");
		label.innerText = "Custom Global CSS";
		label.setAttribute("for", "void-verified-global-css-editor");
		container.append(label);

		const textarea = document.createElement("textarea");
		textarea.setAttribute("id", "void-verified-global-css-editor");
		textarea.value = this.globalCSS.css;

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

	#renderImageHostSettings(cont) {
		const container =
			cont ?? document.getElementById("void-verified-image-host");
		const title = document.createElement("label");
		title.append("Image Host");
		container.append(title);

		const imageHostService = new ImageHostService();
		const imageApiFactory = new ImageApiFactory();

		const select = document.createElement("select");
		select.append(undefined);
		for (const imageHost of Object.values(imageHosts)) {
			select.append(
				this.#createOption(
					imageHost,
					imageHost === imageHostService.getSelectedHost()
				)
			);
		}

		container.append(select);

		const hostSpecificSettings = document.createElement("div");

		const imageHostApi = imageApiFactory.getImageHostInstance();

		hostSpecificSettings.append(imageHostApi.renderSettings());

		container.append(hostSpecificSettings);
	}

	#createOption(value, selected = false) {
		const option = document.createElement("option");
		if (selected) {
			option.setAttribute("selected", true);
		}
		option.setAttribute("value", value);
		option.append(value);
		return option;
	}
}
