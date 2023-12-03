import { ImageApiFactory } from "./api/imageApiFactory";
import { imageHosts, ImageHostService } from "./api/imageHostConfiguration";
import { ColorFunctions } from "./colorFunctions";
import { categories } from "./defaultSettings";
import { GlobalCSS } from "./globalCSS";
import { DOM } from "./helpers/DOM";

export class SettingsUserInterface {
	settings;
	styleHandler;
	globalCSS;
	userCSS;
	AnilistBlue = "120, 180, 255";
	#activeCategory = "all";

	constructor(settings, styleHandler, globalCSS, userCSS) {
		this.settings = settings;
		this.styleHandler = styleHandler;
		this.globalCSS = globalCSS;
		this.userCSS = userCSS;
	}

	renderSettingsUi() {
		this.#checkAuthFromUrl();
		const container = DOM.get(".settings.container > .content");
		const settingsContainer = DOM.create(
			"div",
			"#verified-settings settings"
		);
		container.append(settingsContainer);

		this.renderSettingsUiContent();
	}

	renderSettingsUiContent() {
		const settingsContainer = DOM.get("#void-verified-settings");
		const innerContainer = DOM.create("div");
		this.#renderSettingsHeader(innerContainer);

		this.#renderCategories(innerContainer);
		this.#renderOptions(innerContainer);
		this.#renderUserTable(innerContainer);
		if (this.settings.options.globalCssEnabled.getValue()) {
			this.#renderCustomCssEditor(innerContainer, this.globalCSS);
		}
		if (
			this.settings.auth?.token &&
			(this.settings.options.profileCssEnabled.getValue() ||
				this.settings.options.activityCssEnabled.getValue())
		) {
			this.#renderCustomCssEditor(innerContainer, this.userCSS);
		}

		this.#renderImageHostSettings(innerContainer);

		this.#creatAuthenticationSection(innerContainer);

		settingsContainer.replaceChildren(innerContainer);
	}

	#renderOptions(settingsContainer) {
		const settingsListContainer = DOM.create("div", "settings-list");
		for (const [key, setting] of Object.entries(this.settings.options)) {
			if (
				setting.category !== this.#activeCategory &&
				this.#activeCategory !== "all"
			) {
				continue;
			}
			this.#renderSetting(setting, settingsListContainer, key);
		}

		settingsContainer.append(settingsListContainer);
	}

	removeSettingsUi() {
		const settings = document.querySelector("#void-verified-settings");
		settings?.remove();
	}

	#renderSettingsHeader(settingsContainer) {
		const headerContainer = DOM.create("div", "settings-header");
		const header = DOM.create("h1", null, "VoidVerified Settings");

		const versionInfo = DOM.create("p", null, [
			"Version: ",
			DOM.create("span", null, this.settings.version),
		]);

		headerContainer.append(header);
		headerContainer.append(versionInfo);
		settingsContainer.append(headerContainer);
	}

	#renderCategories(settingsContainer) {
		const nav = DOM.create("nav", "nav");
		const list = DOM.create("ol");

		list.append(this.#createNavBtn("all"));

		for (const category of Object.values(categories)) {
			list.append(this.#createNavBtn(category));
		}

		nav.append(list);
		settingsContainer.append(nav);
	}

	#createNavBtn(category) {
		const className = category === this.#activeCategory ? "active" : null;
		const li = DOM.create("li", className, category);

		li.addEventListener("click", () => {
			this.#activeCategory = category;
			this.renderSettingsUiContent();
		});

		return li;
	}

	#renderUserTable(settingsContainer) {
		const tableContainer = DOM.create("div", "table #verified-user-table");

		tableContainer.style = `
            margin-top: 25px;
        `;

		const table = DOM.create("table");
		const head = DOM.create("thead");
		const headrow = DOM.create("tr", null, [
			DOM.create("th", null, "Username"),
			DOM.create("th", null, "Sign"),
			DOM.create("th", null, "Color"),
			DOM.create("th", null, "Other"),
		]);

		head.append(headrow);

		const body = DOM.create("tbody");

		for (const user of this.settings.verifiedUsers) {
			body.append(this.#createUserRow(user));
		}

		table.append(head);
		table.append(body);
		tableContainer.append(table);

		const inputForm = DOM.create("form", null, null);

		inputForm.addEventListener("submit", (event) => {
			this.#handleVerifyUserForm(event, this.settings);
		});

		inputForm.append(DOM.create("label", null, "Add user"));
		inputForm.append(DOM.create("input", "#verified-add-user"));
		tableContainer.append(inputForm);

		settingsContainer.append(tableContainer);
	}

	#createUserRow(user) {
		const row = DOM.create("tr");
		const userLink = DOM.create("a", null, user.username);
		userLink.setAttribute(
			"href",
			`https://anilist.co/user/${user.username}/`
		);
		userLink.setAttribute("target", "_blank");
		row.append(DOM.create("td", null, userLink));

		const signInput = DOM.create("input");
		signInput.setAttribute("type", "text");
		signInput.value = user.sign ?? "";
		signInput.addEventListener("input", (event) =>
			this.#updateUserOption(user.username, "sign", event.target.value)
		);
		const signCell = DOM.create("td", null, signInput);
		signCell.append(
			this.#createUserCheckbox(
				user.enabledForUsername,
				user.username,
				"enabledForUsername",
				this.settings.options.enabledForUsername.getValue()
			)
		);

		row.append(DOM.create("th", null, signCell));

		const colorInputContainer = DOM.create("div");

		const colorInput = DOM.create("input");
		colorInput.setAttribute("type", "color");
		colorInput.value = this.#getUserColorPickerColor(user);
		colorInput.addEventListener(
			"change",
			(event) => this.#handleUserColorChange(event, user.username),
			false
		);

		colorInputContainer.append(colorInput);

		const resetColorBtn = DOM.create("button", null, "🔄");
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

		const colorCell = DOM.create("td", null, colorInputContainer);
		row.append(colorCell);

		const quickAccessCheckbox = this.#createUserCheckbox(
			user.quickAccessEnabled,
			user.username,
			"quickAccessEnabled",
			this.settings.options.quickAccessEnabled.getValue()
		);

		const otherCell = DOM.create("td", null, quickAccessCheckbox);

		const cssEnabledCheckbox = this.#createUserCheckbox(
			user.onlyLoadCssFromVerifiedUser,
			user.username,
			"onlyLoadCssFromVerifiedUser",
			this.settings.options.onlyLoadCssFromVerifiedUser.getValue()
		);

		otherCell.append(cssEnabledCheckbox);

		row.append(otherCell);

		const deleteButton = DOM.create("button", null, "❌");
		deleteButton.addEventListener("click", () =>
			this.#removeUser(user.username)
		);
		row.append(DOM.create("th", null, deleteButton));
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
		const checkbox = DOM.create("input");
		if (disabled) {
			checkbox.setAttribute("disabled", "");
		}

		checkbox.setAttribute("type", "checkbox");
		checkbox.checked = isChecked;
		checkbox.addEventListener("change", (event) => {
			this.#updateUserOption(username, settingKey, event.target.checked);
			this.renderSettingsUiContent();
		});

		checkbox.title = this.settings.options[settingKey].description;
		return checkbox;
	}

	#handleUserColorReset(username) {
		this.#updateUserOption(username, "colorOverride", undefined);
		this.renderSettingsUiContent();
	}

	#handleUserColorChange(event, username) {
		const color = event.target.value;
		this.#updateUserOption(username, "colorOverride", color);
	}

	#handleVerifyUserForm(event, settings) {
		event.preventDefault();

		const usernameInput = DOM.get("#void-verified-add-user");
		const username = usernameInput.value;
		settings.verifyUser(username);
		usernameInput.value = "";
		this.renderSettingsUiContent();
	}

	#updateUserOption(username, key, value) {
		this.settings.updateUserOption(username, key, value);
		this.styleHandler.refreshStyles();
	}

	#removeUser(username) {
		this.settings.removeUser(username);
		this.renderSettingsUiContent();
		this.styleHandler.refreshStyles();
	}

	#renderSetting(setting, settingsContainer, settingKey, disabled = false) {
		if (setting.category === categories.hidden) {
			return;
		}
		const value = setting.getValue();
		const type = typeof value;

		const container = DOM.create("div");
		const input = DOM.create("input");

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

		const label = DOM.create("label", null, setting.description);
		label.setAttribute("for", settingKey);
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

		this.renderSettingsUiContent();
	}

	#renderCustomCssEditor(settingsContainer, cssHandler) {
		const cssName = cssHandler instanceof GlobalCSS ? "global" : "user";
		const container = DOM.create("div", "css-editor");
		const label = DOM.create("label", null, `Custom ${cssName} CSS`);
		label.setAttribute("for", `void-verified-${cssName}-css-editor`);
		container.append(label);

		const textarea = DOM.create(
			"textarea",
			`#verified-${cssName}-css-editor`
		);
		textarea.value = cssHandler.css;
		textarea.addEventListener("change", (event) => {
			this.#handleCustomCssEditor(event, cssHandler);
		});
		container.append(textarea);

		if (cssName === "global") {
			const notice = DOM.create("div");
			notice.innerText =
				"Please note that Custom CSS is disabled in the settings. \nIn the event that you accidentally disable rendering of critical parts of AniList, navigate to the settings by URL";
			notice.style.fontSize = "11px";
			container.append(notice);
		} else {
			const publishButton = DOM.create("button", null, "Publish");
			publishButton.classList.add("button");
			publishButton.addEventListener("click", (event) =>
				this.#handlePublishCss(event, cssHandler)
			);

			const previewButton = DOM.create(
				"button",
				null,
				cssHandler.preview ? "Disable Preview" : "Enable Preview"
			);
			previewButton.classList.add("button");
			previewButton.addEventListener("click", () => {
				cssHandler.togglePreview();
				previewButton.innerText = cssHandler.preview
					? "Disable Preview"
					: "Enable Preview";
			});

			const resetButton = DOM.create("button", null, "Reset");
			resetButton.classList.add("button");
			resetButton.addEventListener("click", () => {
				if (window.confirm("Your changes will be lost.")) {
					cssHandler.getAuthUserCss().then(() => {
						textarea.value = cssHandler.css;
					});
				}
			});

			container.append(publishButton);
			container.append(previewButton);
			container.append(resetButton);
		}

		settingsContainer.append(container);
	}

	#handlePublishCss(event, cssHandler) {
		const btn = event.target;
		btn.innerText = "Publishing...";
		cssHandler.publishUserCss().then(() => {
			btn.innerText = "Publish";
		});
	}

	#handleCustomCssEditor(event, cssHandler) {
		const value = event.target.value;
		cssHandler.updateCss(value);
	}

	#renderImageHostSettings(settingsContainer) {
		const container = DOM.create("div");
		container.append(DOM.create("label", null, "Image Host"));

		const imageHostService = new ImageHostService();
		const imageApiFactory = new ImageApiFactory();

		const select = DOM.create("select");
		for (const imageHost of Object.values(imageHosts)) {
			select.append(
				this.#createOption(
					imageHost,
					imageHost === imageHostService.getSelectedHost()
				)
			);
		}
		select.value = imageHostService.getSelectedHost();
		select.addEventListener("change", (event) => {
			imageHostService.setSelectedHost(event.target.value);
			this.renderSettingsUi();
		});
		container.append(select);

		const hostSpecificSettings = DOM.create("div");
		const imageHostApi = imageApiFactory.getImageHostInstance();
		hostSpecificSettings.append(imageHostApi.renderSettings());

		container.append(hostSpecificSettings);
		settingsContainer.append(container);
	}

	#createOption(value, selected = false) {
		const option = DOM.create("option", null, value);
		if (selected) {
			option.setAttribute("selected", true);
		}
		option.setAttribute("value", value);
		return option;
	}

	#creatAuthenticationSection(settingsContainer) {
		const isAuthenticated =
			this.settings.auth !== null &&
			new Date(this.settings.auth?.expires) > new Date();

		const clientId = 15519;

		const authenticationContainer = DOM.create("div");

		const header = DOM.create("h3", null, "Authenticate VoidVerified");
		const description = DOM.create(
			"p",
			null,
			"Some features of VoidVerified might need your access token to work correctly or fully. Below is a list of features using your access token. If you do not wish to use any of these features, you do not need to authenticate. If revoking authentication, be sure to revoke VoidVerified from Anilist Apps as well."
		);

		const list = DOM.create("ul");
		for (const option of Object.values(this.settings.options).filter(
			(o) => o.authRequired
		)) {
			list.append(DOM.create("li", null, option.description));
		}

		const authLink = DOM.create("a", "button", "Authenticate VoidVerified");
		authLink.setAttribute(
			"href",
			`https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`
		);

		const removeAuthButton = DOM.create(
			"button",
			null,
			"Revoke auth token"
		);
		removeAuthButton.classList.add("button");
		removeAuthButton.addEventListener("click", () => {
			this.settings.removeAuthToken();
			this.renderSettingsUiContent();
		});

		authenticationContainer.append(header);
		authenticationContainer.append(description);
		authenticationContainer.append(list);
		authenticationContainer.append(
			!isAuthenticated ? authLink : removeAuthButton
		);

		settingsContainer.append(authenticationContainer);
	}

	#checkAuthFromUrl() {
		const hash = window.location.hash.substring(1);
		if (!hash) {
			return;
		}

		const [path, token, type, expiress] = hash.split("&");
		if (path !== "void_auth") {
			return;
		}

		const expiresDate = new Date(
			new Date().getTime() + Number(expiress.split("=")[1]) * 1000
		);

		this.settings.saveAuthToken({
			token: token.split("=")[1],
			expires: expiresDate,
		});

		window.history.replaceState(
			null,
			"",
			"https://anilist.co/settings/developer"
		);
	}
}
