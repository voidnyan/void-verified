import { ImageApiFactory } from "../api/imageApiFactory";
import { imageHosts, ImageHostService } from "../api/imageHostConfiguration";
import { ImgurAPI } from "../api/imgurAPI";
import { ColorFunctions } from "../utils/colorFunctions";
import {
	Checkbox,
	InputField,
	Label,
	Link,
	Option,
	Select,
	SettingLabel,
	Table,
	TableBody,
	TableHead,
	TextArea,
	ColorPicker,
	IconButton,
} from "../components/components";
import { categories } from "../assets/defaultSettings";
import { GlobalCSS } from "./globalCSS";
import { DOM } from "../helpers/DOM";
import { Toaster } from "../utils/toaster";
import { RefreshIcon } from "../assets/icons";

const subCategories = {
	users: "users",
	authorization: "authorization",
	imageHost: "image host",
	layout: "layout & CSS",
	globalCss: "global CSS",
	toasts: "toasts",
};

export class SettingsUserInterface {
	settings;
	styleHandler;
	globalCSS;
	userCSS;
	layoutDesigner;
	AnilistBlue = "120, 180, 255";
	#activeCategory = "all";
	#activeSubCategory = subCategories.imageHost;

	constructor(settings, styleHandler, globalCSS, userCSS, layoutDesigner) {
		this.settings = settings;
		this.styleHandler = styleHandler;
		this.globalCSS = globalCSS;
		this.userCSS = userCSS;
		this.layoutDesigner = layoutDesigner;
	}

	renderSettingsUi() {
		this.#checkAuthFromUrl();
		const container = DOM.get(".settings.container > .content");
		const settingsContainerExists =
			DOM.get("#void-verified-settings") !== null;
		if (!settingsContainerExists) {
			const settingsContainer = DOM.create(
				"div",
				"#verified-settings settings"
			);
			container.append(settingsContainer);
		}

		this.renderSettingsUiContent();
	}

	renderSettingsUiContent() {
		const settingsContainer = DOM.create("div");

		this.#renderSettingsHeader(settingsContainer);
		this.#renderCategories(settingsContainer);
		this.#renderOptions(settingsContainer);
		this.#handleSubcategories(settingsContainer);

		DOM.get("#void-verified-settings").replaceChildren(settingsContainer);
	}

	#handleSubcategories(settingsContainer) {
		this.#renderSubCategoriesNavigation(settingsContainer);
		switch (this.#activeSubCategory) {
			case subCategories.users:
				this.#renderUserTable(settingsContainer);
				break;
			case subCategories.authorization:
				this.#creatAuthenticationSection(settingsContainer);
				break;
			case subCategories.imageHost:
				this.#renderImageHostSettings(settingsContainer);
				break;
			case subCategories.layout:
				settingsContainer.append(
					this.layoutDesigner.renderSettings(this)
				);
				if (
					this.settings.auth?.token &&
					(this.settings.options.profileCssEnabled.getValue() ||
						this.settings.options.activityCssEnabled.getValue())
				) {
					this.#renderCustomCssEditor(
						settingsContainer,
						this.userCSS
					);
				}
				break;
			case subCategories.globalCss:
				if (this.settings.options.globalCssEnabled.getValue()) {
					this.#renderCustomCssEditor(
						settingsContainer,
						this.globalCSS
					);
				}
				break;
			case subCategories.toasts:
				settingsContainer.append(Toaster.renderSettings(this));
		}
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
		const author = DOM.create("p", null, [
			"Author: ",
			Link("voidnyan", "https://anilist.co/user/voidnyan/"),
		]);

		headerContainer.append(header, versionInfo, author);

		settingsContainer.append(headerContainer);
	}

	#renderCategories(settingsContainer) {
		const nav = DOM.create("nav", "nav");
		const list = DOM.create("ol");

		const onClick = (_category) => {
			this.#activeCategory = _category;
			this.renderSettingsUiContent();
		};

		list.append(
			this.#createNavBtn("all", "all" === this.#activeCategory, () => {
				onClick("all");
			})
		);

		for (const category of Object.values(categories)) {
			list.append(
				this.#createNavBtn(
					category,
					category === this.#activeCategory,
					() => {
						onClick(category);
					}
				)
			);
		}

		nav.append(list);
		settingsContainer.append(nav);
	}

	#renderSubCategoriesNavigation(settingsContainer) {
		const nav = DOM.create("nav", "nav");
		const list = DOM.create("ol");

		for (const subCategory of Object.values(subCategories)) {
			if (!this.#shouldDisplaySubCategory(subCategory)) {
				continue;
			}
			list.append(
				this.#createNavBtn(
					subCategory,
					this.#activeSubCategory === subCategory,
					() => {
						this.#activeSubCategory = subCategory;
						this.renderSettingsUiContent();
					}
				)
			);
		}

		nav.append(list);
		settingsContainer.append(nav);
	}

	#shouldDisplaySubCategory(subCategory) {
		switch (subCategory) {
			case subCategories.users:
				return true;
			case subCategories.authorization:
				return true;
			case subCategories.imageHost:
				return this.settings.options.pasteImagesToHostService.getValue();
			case subCategories.layout:
				return (
					this.settings.auth?.token &&
					(this.settings.options.profileCssEnabled.getValue() ||
						this.settings.options.activityCssEnabled.getValue() ||
						this.settings.options.layoutDesignerEnabled.getValue())
				);
			case subCategories.globalCss:
				return this.settings.options.globalCssEnabled.getValue();
			case subCategories.toasts:
				return this.settings.options.toasterEnabled.getValue();
		}
	}

	#createNavBtn(category, isActive, onClick) {
		const className = isActive ? "active" : null;
		const li = DOM.create("li", className, category);

		li.addEventListener("click", () => {
			onClick();
		});

		return li;
	}

	#renderUserTable(settingsContainer) {
		const tableContainer = DOM.create("div", "table #verified-user-table");

		tableContainer.style = `
            margin-top: 25px;
        `;
		const head = TableHead("Username", "Sign", "Color", "Other");

		const rows = this.settings.verifiedUsers.map((user) =>
			this.#createUserRow(user)
		);
		const body = TableBody(rows);

		const table = Table(head, body);
		tableContainer.append(table);

		const inputForm = DOM.create("form");

		inputForm.addEventListener("submit", (event) => {
			this.#handleVerifyUserForm(event, this.settings);
		});

		const inputFormLabel = DOM.create("label", null, "Add user");
		inputFormLabel.setAttribute("for", "void-verified-add-user");

		inputForm.append(inputFormLabel);
		inputForm.append(InputField("", () => {}, "#verified-add-user"));
		tableContainer.append(inputForm);

		settingsContainer.append(tableContainer);

		const fallbackColorOption = this.settings.options.defaultHighlightColor;
		settingsContainer.append(
			DOM.create("h5", null, "Fallback color"),
			ColorPicker(fallbackColorOption.getValue(), (event) => {
				this.#handleOption(event, "fallbackColor");
			})
		);
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

		const signInput = InputField(
			user.sign ?? "",
			(event) => {
				this.#updateUserOption(
					user.username,
					"sign",
					event.target.value
				);
			},
			"sign"
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

		colorInputContainer.append(
			IconButton(RefreshIcon(), () => {
				this.#handleUserColorReset(user.username);
			})
		);

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
		const onChange = (event) => {
			this.#updateUserOption(username, settingKey, event.target.checked);
			this.renderSettingsUiContent();
		};
		const checkbox = Checkbox(
			isChecked,
			onChange,
			this.settings.options[settingKey].description,
			disabled,
			true
		);
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

	async #handleVerifyUserForm(event, settings) {
		event.preventDefault();

		const usernameInput = DOM.get("#void-verified-add-user");
		const username = usernameInput.value;
		await settings.verifyUser(username);
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

	#renderSetting(setting, settingsContainer, settingKey) {
		if (setting.category === categories.hidden) {
			return;
		}
		const value = setting.getValue();
		const type = typeof value;

		let input;

		const onChange = (event) => {
			this.#handleOption(event, settingKey, type);
		};

		if (type === "boolean") {
			input = Checkbox(value, onChange);
		} else if (settingKey == "defaultHighlightColor") {
			return;
		} else if (type === "string") {
			input = InputField(value, onChange);
		}
		input.setAttribute("id", settingKey);

		settingsContainer.append(SettingLabel(setting.description, input));
	}

	#handleOption(event, settingKey, type) {
		const value =
			type === "boolean" ? event.target.checked : event.target.value;
		this.settings.saveSettingToLocalStorage(settingKey, value);
		this.styleHandler.refreshStyles();

		if (!this.#shouldDisplaySubCategory(this.#activeSubCategory)) {
			this.#activeSubCategory = subCategories.users;
		}

		this.renderSettingsUiContent();
	}

	// TODO: separate userCSS
	#renderCustomCssEditor(settingsContainer, cssHandler) {
		const cssName = cssHandler instanceof GlobalCSS ? "global" : "user";
		const container = DOM.create("div", "css-editor");
		const label = DOM.create("label", null, `Custom ${cssName} CSS`);
		label.setAttribute("for", `void-verified-${cssName}-css-editor`);
		container.append(label);

		const textarea = TextArea(cssHandler.css, (event) => {
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

	// TODO: separate userCSS
	#handlePublishCss(event, cssHandler) {
		const btn = event.target;
		btn.innerText = "Publishing...";
		cssHandler.publishUserCss().then(() => {
			btn.innerText = "Publish";
		});
	}

	// TODO: separate userCSS
	#handleCustomCssEditor(event, cssHandler) {
		const value = event.target.value;
		cssHandler.updateCss(value);
	}

	// TODO: separate to imageHostService?
	#renderImageHostSettings(settingsContainer) {
		const container = DOM.create("div");

		const imageHostService = new ImageHostService();
		const imageApiFactory = new ImageApiFactory();

		const imageHostOptions = Object.values(imageHosts).map((imageHost) =>
			Option(
				imageHost,
				imageHost === imageHostService.getSelectedHost(),
				() => {
					imageHostService.setSelectedHost(imageHost);
					this.renderSettingsUiContent();
				}
			)
		);

		const select = Select(imageHostOptions);
		container.append(Label("Image host", select));

		const hostSpecificSettings = DOM.create("div");
		const imageHostApi = imageApiFactory.getImageHostInstance();
		hostSpecificSettings.append(imageHostApi.renderSettings(this));

		container.append(hostSpecificSettings);
		settingsContainer.append(container);
	}

	#creatAuthenticationSection(settingsContainer) {
		const isAuthenticated =
			this.settings.auth !== null &&
			new Date(this.settings.auth?.expires) > new Date();

		const clientId = 15519;

		const authenticationContainer = DOM.create("div");

		const header = DOM.create("h3", null, "Authorize VoidVerified");
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

		if (path === "void_imgur") {
			const imgurConfig =
				new ImageHostService().getImageHostConfiguration(
					imageHosts.imgur
				);
			new ImgurAPI(imgurConfig).handleAuth();
		}
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
