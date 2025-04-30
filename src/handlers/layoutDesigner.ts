import { DOM } from "../utils/DOM";
import { ColorFunctions } from "../utils/colorFunctions";
import {
	Button,
	ColorPicker,
	IconButton,
	InputField,
	Label,
	Note,
	Option,
	Select,
	TextArea,
} from "../components/components";
import { AnilistAPI } from "../api/anilistAPI";
import { Markdown } from "../utils/markdown";
import { Toaster } from "../utils/toaster";
import { AddIcon, TrashcanIcon } from "../assets/icons";
import {LocalStorageKeys} from "../assets/localStorageKeys";
import {StaticSettings} from "../utils/staticSettings";
import {AnilistAuth} from "../utils/anilistAuth";
import {ButtonComponent} from "../components/ButtonComponent";

class Layout {
	avatar;
	banner;
	bio;
	color;
	donatorBadge;
	name;

	constructor(layout?) {
		this.avatar = layout?.avatar ?? "";
		this.banner = layout?.banner ?? "";
		this.bio = layout?.bio ?? "";
		this.color = layout?.color ?? "";
		this.donatorBadge = layout?.donatorBadge ?? "";
		this.name = layout?.name ?? "New Layout";
	}
}

export class LayoutDesigner {
	private static layoutsInLocalStorage = LocalStorageKeys.layouts;
	private static originalHtml;
	private static broadcastChannel;
	private static donatorTier = 0;
	private static anilistSettings;
	private static layout;
	private static layouts = {
		selectedLayout: 0,
		preview: false,
		disableCss: false,
		layoutsList: [new Layout()],
	};

	private static settingContainer = DOM.createDiv("layout-designer-container");

	static initialize() {
		this.broadcastChannel = new BroadcastChannel("void-layouts");
		this.broadcastChannel.addEventListener("message", (event: Event) =>
			this.handleBroadcastMessage(event),
		);

		const layouts = JSON.parse(
			localStorage.getItem(this.layoutsInLocalStorage),
		);
		if (layouts) {
			this.layouts = layouts;
			this.layouts.layoutsList = layouts.layoutsList.map(
				(layout) => new Layout(layout),
			);
		}

		this.anilistSettings = JSON.parse(localStorage.getItem("auth"));

		this.donatorTier = this.anilistSettings?.donatorTier;
		this.layout = this.getSelectedLayout();
	}

	static renderLayoutPreview() {
		if (!StaticSettings.options.layoutDesignerEnabled.getValue()) {
			return;
		}

		if (!window.location.pathname.startsWith("/user/")) {
			return;
		}
		const username =
			window.location.pathname.match(/^\/user\/([^/]*)\/?/)[1];

		if (username !== AnilistAuth.name || !this.layouts.preview) {
			return;
		}

		this.handleAvatar(this.layout.avatar);
		this.handleBanner(this.layout.banner);
		this.handleColor(this.layout.color);
		this.handleDonatorBadge(this.layout.donatorBadge);
		this.handleCss();
		this.handleAbout(Markdown.parse(this.layout.bio ?? ""));
	}

	private static handleBroadcastMessage(event) {
		switch (event.data.type) {
			case "preview":
				this.handlePreviewToggleMessage(event.data.preview);
				break;
			case "layout":
				this.handleLayoutMessage(event.data.layout);
				break;
			case "css":
				this.handleCssMessage(event.data.disableCss);
				break;
		}
	}

	private static handlePreviewToggleMessage(preview) {
		this.layouts.preview = preview;
		if (
			preview ||
			!window.location.pathname.startsWith(
				`/user/${AnilistAuth.name}/`,
			)
		) {
			return;
		}

		this.handleAvatar(this.anilistSettings?.avatar?.large);
		this.handleBanner(this.anilistSettings?.bannerImage);
		this.handleColor(this.anilistSettings.options.profileColor);
		this.handleDonatorBadge(this.anilistSettings.donatorBadge);
		this.layouts.disableCss = false;
		this.handleCss();
		this.handleAbout(this.originalHtml);
	}

	private static handleLayoutMessage(layout) {
		this.layout = layout;
	}

	private static handleCssMessage(disableCss) {
		this.layouts.disableCss = disableCss;
	}

	private static handleAvatar(avatar) {
		if (avatar === "") {
			return;
		}

		const avatarElement = document.querySelector("img.avatar") as HTMLImageElement;
		if (avatarElement.src !== avatar) {
			avatarElement.src = avatar;
		}

		const avatarLinks = document.querySelectorAll<HTMLAnchorElement>(
			`a.avatar[href*="${AnilistAuth.name}"]`,
		);
		for (const avatarLink of avatarLinks) {
			if (avatarLink.getAttribute("style") !== `background-image: url(${avatar})`) {
				avatarLink.setAttribute("style",  `background-image: url(${avatar})`);
			}
		}
	}

	private static handleBanner(banner) {
		if (banner === "") {
			return;
		}

		const bannerElement = document.querySelector<HTMLDivElement>(".banner");
		if (bannerElement.getAttribute("style") !== `background-image: url(${banner})`) {
			bannerElement.setAttribute("style", `background-image: url(${banner})`);
		}
	}

	static handleColor(value) {
		let color;
		try {
			color = ColorFunctions.handleAnilistColor(value);
		} catch (err) {
			return;
		}

		const pageContent = document.querySelector<HTMLDivElement>(".page-content > .user");
		pageContent.style.setProperty("--color-blue", color);
		pageContent.style.setProperty("--color-blue-dim", color);
	}

	static handleDonatorBadge(donatorText) {
		if (this.donatorTier < 3 || donatorText === "") {
			return;
		}

		const donatorBadge = document.querySelector<HTMLDivElement>(".donator-badge");
		if (donatorBadge.innerText !== donatorText) {
			donatorBadge.innerText = donatorText;
		}
	}

	static handleCss() {
		if (this.layouts.disableCss) {
			DOM.get("#verified-user-css-styles")?.setAttribute(
				"disabled",
				"true",
			);
		} else {
			DOM.get("#verified-user-css-styles")?.removeAttribute("disabled");
		}
	}

	static handleAbout(about) {
		const aboutContainer = document.querySelector(".about .markdown");

		if (!aboutContainer) {
			return;
		}

		if (!this.originalHtml) {
			this.originalHtml = aboutContainer.innerHTML;
		}

		aboutContainer.innerHTML = about !== "" ? about : this.originalHtml;
	}

	static createSettings() {
		this.renderSettings();
		return this.settingContainer;
	}

	static renderSettings() {
		this.settingContainer.replaceChildren();
		const header = DOM.create("h3", null, "Layout Designer");

		const layoutSelector = this.createLayoutSelector();
		const layoutInfoSection = this.layoutInfoSection();

		const imageSection = DOM.create("div");

		imageSection.append(
			this.createImageField("avatar", this.layout.avatar),
		);

		imageSection.append(
			this.createImageField("banner", this.layout.banner),
		);

		const imageUploadNote = Note(
			"You can preview avatar & banner by providing a link to an image. If you have configured a image host, you can upload images by pasting them to the fields. ",
		);

		imageUploadNote.append(
			DOM.create("br"),
			"Unfortunately AniList API does not support third parties uploading new avatars or banners. You have to upload them separately.",
		);

		const colorSelection = this.createColorSelection();

		const previewButton = new ButtonComponent(this.layouts.preview ? "Disable Preview" : "Enable Preview", () => {
			this.togglePreview();
			previewButton.setText(this.layouts.preview ? "Disable Preview" : "Enable Preview");
		});


		const cssButton = new ButtonComponent(this.layouts.disableCss ? "Enable Css" : "Disable Css", () => {
			this.toggleCss();
			cssButton.setText(this.layouts.disableCss ? "Enable Css" : "Disable Css");
		});

		const getAboutButton = Button(
			"Reset About",
			() => {
				this.getUserAbout();
			},
			"error",
		);

		this.settingContainer.append(
			header,
			layoutSelector,
			layoutInfoSection,
			imageSection,
			imageUploadNote,
			colorSelection,
		);

		if (this.donatorTier >= 3) {
			this.settingContainer.append(this.createDonatorBadgeField());
		}

		this.settingContainer.append(this.createAboutSection(), getAboutButton);

		if (AnilistAuth.token) {
			const saveAboutButton = Button(
				"Publish About",
				(event) => {
					this.publishAbout(event);
				},
				"success",
			);
			this.settingContainer.append(saveAboutButton);
		}

		this.settingContainer.append(previewButton.element);

		if (this.layouts.preview) {
			this.settingContainer.append(cssButton.element);
		}
	}

	private static createLayoutSelector() {
		const container = DOM.create("div");
		container.append(
			IconButton(AddIcon(), () => {
				this.addLayout();
				this.renderSettings();
			}),
		);
		const options = this.layouts.layoutsList.map((layout, index) =>
			Option(
				`${layout.name} #${index + 1}`,
				index === this.layouts.selectedLayout,
				() => {
					this.switchLayout(index);
					this.renderSettings();
				},
			),
		);

		container.append(Select(options));
		return container;
	}

	private static switchLayout(index) {
		this.layout = this.layouts.layoutsList[index];
		this.layouts.selectedLayout = index;
		this.saveToLocalStorage();
		this.broadcastLayoutChange();
	}

	private static addLayout() {
		const layout = new Layout();
		this.layout = layout;
		this.layouts.layoutsList.push(layout);
		this.layouts.selectedLayout = Math.max(
			this.layouts.layoutsList.length - 1,
			0,
		);
		this.saveToLocalStorage();
		this.broadcastLayoutChange();
	}

	private static deleteLayout() {
		if (!window.confirm("Are you sure you want to delete this layout?")) {
			return;
		}
		this.layouts.layoutsList.splice(this.layouts.selectedLayout, 1);
		this.layouts.selectedLayout = Math.max(
			this.layouts.selectedLayout - 1,
			0,
		);

		if (this.layouts.layoutsList.length === 0) {
			this.layouts.layoutsList.push(new Layout());
		}

		this.layout = this.layouts.layoutsList[this.layouts.selectedLayout];
		this.saveToLocalStorage();
		this.broadcastLayoutChange();
	}

	private static layoutInfoSection() {
		const container = Label(
			"Layout name",
			InputField(this.layout?.name, (event) => {
				this.updateOption("name", event.target.value);
			}),
		);

		container.append(
			IconButton(TrashcanIcon(), () => {
				this.deleteLayout();
				this.renderSettings();
			}),
		);
		return container;
	}

	private static createInputField(field, value) {
		const input = InputField(value, (event) => {
			this.updateOption(field, event.target.value);
		});
		return input;
	}

	private static createImageField(field, value) {
		const container = DOM.create("div", "layout-image-container");
		const header = DOM.create("h5", "layout-header", field);
		const display = DOM.create("div", `layout-image-display ${field}`);
		display.style.backgroundImage = `url(${value})`;
		const input = this.createInputField(field, value);

		container.append(header, display, input);
		return container;
	}

	private static createDonatorBadgeField() {
		const container = DOM.create("div", "layout-donator-badge-container");
		const donatorHeader = DOM.create(
			"h5",
			"layout-header",
			"Donator Badge",
		);
		const donatorInput = InputField(this.layout.donatorBadge, (event) => {
			this.updateOption("donatorBadge", event.target.value);
		});
		donatorInput.setAttribute("maxlength", "24");

		container.append(donatorHeader, donatorInput);

		if (
			this.layout.donatorBadge !== this.anilistSettings.donatorBadge &&
			this.layout.donatorBadge !== "" &&
			AnilistAuth.token
		) {
			const publishButton = Button("Publish Donator Badge", (event) => {
				this.publishDonatorText(event);
			});
			container.append(DOM.create("div", null, publishButton));
		}

		return container;
	}

	private static createColorSelection() {
		const container = DOM.create("div", "layout-color-selection");

		const header = DOM.create("h5", "layout-header", "Color");
		container.append(header);

		for (const anilistColor of ColorFunctions.defaultColors) {
			container.append(this.createColorButton(anilistColor));
		}

		if (this.donatorTier >= 2) {
			const isDefaultColor = ColorFunctions.defaultColors.some(
				(color) => color === this.layout.color,
			);

			const colorInput = ColorPicker(
				isDefaultColor ? "" : this.layout.color,
				(event) => {
					this.updateOption("color", event.target.value);
				},
			);
			if (!isDefaultColor && this.layout.color !== "") {
				colorInput.classList.add("active");
			}
			container.append(colorInput);
		}

		if (
			AnilistAuth.token &&
			this.layout.color.toLocaleLowerCase() !==
				this.anilistSettings?.options?.profileColor?.toLocaleLowerCase() &&
			this.layout.color !== ""
		) {
			const publishButton = Button("Publish Color", (event) => {
				this.publishColor(event);
			});
			container.append(DOM.create("div", null, publishButton));
		}

		return container;
	}

	private static createAboutSection() {
		const container = DOM.create("div");
		const aboutHeader = DOM.create("h5", "layout-header", "About");
		const aboutInput = TextArea(this.layout.bio, (event) => {
			this.updateOption("bio", event.target.value);
		});
		const note = Note(
			"Please note that VoidVerified does not have access to AniList's markdown parser. AniList specific features might not be available while previewing. Recommended to be used for smaller changes like previewing a different image for a layout.",
		);

		container.append(aboutHeader, aboutInput, note);
		return container;
	}

	static async publishAbout(event) {
		const button = event.target;
		button.innerText = "Publishing...";

		try {
			let currentAbout = await AnilistAPI.getUserAbout(
				AnilistAuth.name,
			);
			if (!currentAbout) {
				currentAbout = "";
			}
			const about = this.transformAbout(currentAbout, this.layout.bio);

			await AnilistAPI.saveUserAbout(about);
			Toaster.success("About published.");
			this.renderSettings();
		} catch (error) {
			Toaster.error("Failed to publish about.", error);
		}
	}

	static transformAbout(currentAbout, newAbout) {
		const json = currentAbout.match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/)?.[1];

		if (!json) {
			return newAbout;
		}

		const about = `[](json${json})` + newAbout;
		return about;
	}

	static async publishColor(event) {
		const button = event.target;
		const color = this.layout.color;
		button.innerText = "Publishing...";

		try {
			const result = await AnilistAPI.saveUserColor(color);
			const profileColor = result.UpdateUser?.options?.profileColor;
			this.anilistSettings.options.profileColor = profileColor;
			Toaster.success("Color published.");
		} catch (error) {
			Toaster.error("Failed to publish color.", error);
		} finally {
			this.renderSettings();
		}
	}

	static async publishDonatorText(event) {
		const button = event.target;
		const donatorText = this.layout.donatorBadge;
		button.innerText = "Publishing...";

		try {
			const result = await AnilistAPI.saveDonatorBadge(donatorText);
			const donatorBadge = result.UpdateUser?.donatorBadge;
			this.anilistSettings.donatorBadge = donatorBadge;
			Toaster.success("Donator badge published.");
		} catch (error) {
			Toaster.error("Failed to publish donator badge.", error);
		} finally {
			this.renderSettings();
		}
	}

	static async getUserAbout() {
		if (
			this.layout.bio !== "" &&
			!window.confirm(
				"Are you sure you want to reset about? Any changes will be lost.",
			)
		) {
			return;
		}

		try {
			Toaster.debug("Querying user about.");
			const about = await AnilistAPI.getUserAbout(
				AnilistAuth.name,
			);
			const clearedAbout = this.removeJson(about);

			this.updateOption("bio", clearedAbout);
			Toaster.success("About reset.");
		} catch (error) {
			Toaster.error("Failed to query current about from AniList API.", error);
		}
	}

	static removeJson(about) {
		return about.replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/, "");
	}

	static createColorButton(anilistColor) {
		const button = DOM.create("div", "color-button");
		button.style.backgroundColor = `rgb(${ColorFunctions.handleAnilistColor(
			anilistColor,
		)})`;

		button.addEventListener("click", () => {
			this.updateOption("color", anilistColor);
		});

		if (this.layout.color === anilistColor) {
			button.classList.add("active");
		}

		return button;
	}

	static updateOption(field, value) {
		this.layout[field] = value;
		this.updateLayout(this.layout);
		this.renderSettings();
	}

	static togglePreview() {
		this.layouts.preview = !this.layouts.preview;
		if (!this.layouts.preview) {
			this.layouts.disableCss = false;
		}
		this.broadcastChannel.postMessage({
			type: "preview",
			preview: this.layouts.preview,
		});
		this.saveToLocalStorage();
		this.renderSettings();
	}

	static toggleCss() {
		this.layouts.disableCss = !this.layouts.disableCss;
		this.broadcastChannel.postMessage({
			type: "css",
			disableCss: this.layouts.disableCss,
		});
		this.saveToLocalStorage();
	}

	static getSelectedLayout() {
		return this.layouts.layoutsList[this.layouts.selectedLayout];
	}

	static updateLayout(layout) {
		this.layouts.layoutsList[this.layouts.selectedLayout] = layout;
		this.saveToLocalStorage();
		this.broadcastLayoutChange();
	}

	static broadcastLayoutChange() {
		this.broadcastChannel.postMessage({
			type: "layout",
			layout: this.layout,
		});
	}

	static saveToLocalStorage() {
		localStorage.setItem(
			this.layoutsInLocalStorage,
			JSON.stringify(this.layouts),
		);
	}
}
