import {AnilistAuth} from "../utils/anilistAuth";
import {DOM} from "../utils/DOM";
import {Button, Checkbox, InputField, Link, SettingLabel} from "../components/components";
import {ChangeLog} from "../utils/changeLog";
import {StaticSettings} from "../utils/staticSettings";
import {categories} from "../assets/defaultSettings";
import {SelectComponent} from "../components/selectComponent";
import {IOption} from "../types/settings";
import {Toaster} from "../utils/toaster";
import {GoalsHandler} from "./goalsHandler";
import {MiniProfileHandler} from "./miniProfileHandler";
import {ConfigHandler} from "./ConfigHandler";
import {Time} from "../utils/time";
import {QuickStartHandler} from "./quickStart/quickStartHandler";
import {VerifiedUsers} from "../utils/verifiedUsers";
import {GlobalCSS} from "./globalCSS";
import {ImageHostService} from "../api/imageHostConfiguration";
import {LayoutDesigner} from "./layoutDesigner";

const subCategories = {
	users: "users",
	authorization: "authorization",
	imageHost: "image host",
	layout: "layout",
	globalCss: "global CSS",
	goals: "goals",
	toasts: "toasts",
	miniProfile: "mini profile",
	quickStart: "quickStart",
	importExport: "Import/Export",
	time: "time"
};

export class SettingsUi {
	private static activeCategory = "all";
	private static activeSubCategory = "users";

	static container: HTMLDivElement = DOM.createDiv("settings");
	static options: HTMLDivElement = DOM.createDiv("settings-list");
	static subCategoryNav: HTMLDivElement = DOM.createDiv("nav");
	static subCategoryContainer: HTMLDivElement = DOM.createDiv();

	static render() {
		AnilistAuth.checkAuthFromUrl();
		const container = document.querySelector(
			".settings.container > .content",
		);

		if (container.querySelector(".void-verfied-settings")) {
			return;
		}

		this.createSettings();
		container.append(this.container);
	}

	static removeSettings() {
		this.container?.remove();
	}

	private static createSettings() {
		this.container.replaceChildren();
		this.createScriptInfo();
		this.renderCategories();
		this.renderOptions();
		this.container.append(this.options);
		this.renderSubcategoriesNav();
		this.container.append(this.subCategoryNav);
		this.renderSubCategory();
		this.container.append(this.subCategoryContainer);
	}

	private static createScriptInfo() {
		const headerContainer = DOM.create("div", "settings-header");
		const header = DOM.create("h1", null, "VoidVerified Settings");

		const versionInfo = DOM.create("p", null, [
			"Version: ",
			DOM.create("span", null, StaticSettings.version),
		]);

		headerContainer.append(header);
		headerContainer.append(versionInfo);
		const author = DOM.create("p", null, [
			"Author: ",
			Link("voidnyan", "/user/voidnyan/"),
		]);

		const changeLogButton = Button("View Changelog", () => {
			new ChangeLog(StaticSettings.settingsInstance).renderChangeLog(true);
		});

		headerContainer.append(header, versionInfo, author, changeLogButton);
		this.container.append(headerContainer);
	}

	private static renderCategories() {
		const nav = new SelectComponent("all",
			["all", ...Object.values(categories)],
				(value: string) => {
					this.activeCategory = value;
					this.renderOptions();
				});

		this.container.append(DOM.createDiv("nav", nav.element));
	}

	private static renderOptions() {
		this.createOption = this.createOption.bind(this);
		const options = Object.values(StaticSettings.options)
			.filter((option: IOption) => option.category === this.activeCategory || this.activeCategory === "all")
			.map(this.createOption);

		this.options.replaceChildren(...options);
	}

	private static createOption(option: IOption): HTMLDivElement {
		const value = option.getValue();
		const type = typeof value;

		let input: HTMLInputElement;
		if (type === "boolean") {
			input = Checkbox(value, (event) => {
				option.setValue(event.target.checked);
				if (!this.shouldRenderSubcategory(this.activeSubCategory)) {
					this.activeSubCategory = subCategories.users;
					this.renderSubCategory();
				}
				this.renderSubcategoriesNav();
			}) as HTMLInputElement;
		} else if (type === "string" || type === "number") {
			input = InputField(value, (event) => {
				option.setValue(event.target.value);
				if (!this.shouldRenderSubcategory(this.activeSubCategory)) {
					this.activeSubCategory = subCategories.users;
					this.renderSubCategory();
				}
				this.renderSubcategoriesNav();
			}) as HTMLInputElement;
			if (type === "number") {
				input.setAttribute("type", type);
			}
		}

		input.setAttribute("id", option.key);

		const settingLabel = SettingLabel(option.description, input) as HTMLDivElement;

		if (option.authRequired) {
			settingLabel.classList.add("void-auth-required");
		}
		return settingLabel;
	}

	private static renderSubcategoriesNav() {
		const subCats = Object.values(subCategories).filter(this.shouldRenderSubcategory);
		const select = new SelectComponent("users", subCats, (value: string) => {
			this.activeSubCategory = value;
			this.renderSubCategory();
		});

		this.subCategoryNav.replaceChildren(select.element);
	}

	private static shouldRenderSubcategory(subCategory: string) {
		switch (subCategory) {
			case subCategories.users:
			case subCategories.importExport:
			case subCategories.authorization:
			case subCategories.time:
				return true;
			case subCategories.imageHost:
				return StaticSettings.options.pasteImagesToHostService.getValue();
			case subCategories.layout:
				return StaticSettings.options.layoutDesignerEnabled.getValue();
			case subCategories.globalCss:
				return StaticSettings.options.globalCssEnabled.getValue();
			case subCategories.toasts:
				return StaticSettings.options.toasterEnabled.getValue();
			case subCategories.goals:
				return StaticSettings.options.goalsEnabled.getValue();
			case subCategories.miniProfile:
				return StaticSettings.options.miniProfileEnabled.getValue();
			case subCategories.quickStart:
				return StaticSettings.options.quickStartEnabled.getValue();
		}
	}

	private static renderSubCategory() {
		this.subCategoryContainer.replaceChildren(this.getSubCategoryContainer());
	}

	private static getSubCategoryContainer(): HTMLDivElement {
		switch (this.activeSubCategory) {
			case subCategories.users:
				return VerifiedUsers.createUserTable();
			case subCategories.authorization:
				return AnilistAuth.createSettings();
			case subCategories.imageHost:
				return ImageHostService.createImageHostSettings();
			case subCategories.layout:
				return LayoutDesigner.createSettings();
			case subCategories.globalCss:
				return GlobalCSS.renderEditor();
			case subCategories.toasts:
				return Toaster.renderSettings();
			case subCategories.goals:
				return GoalsHandler.renderSettings();
			case subCategories.miniProfile:
				return MiniProfileHandler.renderSettings();
			case subCategories.importExport:
				return ConfigHandler.renderSettings();
			case subCategories.time:
				return Time.renderConfig();
			case subCategories.quickStart:
				return QuickStartHandler.createConfigContainer();
		}
	}
}
