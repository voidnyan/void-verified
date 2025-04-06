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

class Layout {
	avatar;
	banner;
	bio;
	color;
	donatorBadge;
	name;

	constructor(layout) {
		this.avatar = layout?.avatar ?? "";
		this.banner = layout?.banner ?? "";
		this.bio = layout?.bio ?? "";
		this.color = layout?.color ?? "";
		this.donatorBadge = layout?.donatorBadge ?? "";
		this.name = layout?.name ?? "New Layout";
	}
}

export class LayoutDesigner {
	#settings;
	#layoutsInLocalStorage = LocalStorageKeys.layouts;
	#originalHtml;
	#broadcastChannel;
	#donatorTier = 0;
	#anilistSettings;
	#layout;
	#layouts = {
		selectedLayout: 0,
		preview: false,
		disableCss: false,
		layoutsList: [new Layout()],
	};

	constructor(settings) {
		this.#settings = settings;

		this.#broadcastChannel = new BroadcastChannel("void-layouts");
		this.#broadcastChannel.addEventListener("message", (event) =>
			this.#handleBroadcastMessage(event),
		);

		const layouts = JSON.parse(
			localStorage.getItem(this.#layoutsInLocalStorage),
		);
		if (layouts) {
			this.#layouts = layouts;
			this.#layouts.layoutsList = layouts.layoutsList.map(
				(layout) => new Layout(layout),
			);
		}

		this.#anilistSettings = JSON.parse(localStorage.getItem("auth"));

		this.#donatorTier = this.#anilistSettings?.donatorTier;
		this.#layout = this.#getSelectedLayout();
	}

	renderLayoutPreview() {
		if (!this.#settings.options.layoutDesignerEnabled.getValue()) {
			return;
		}

		if (!window.location.pathname.startsWith("/user/")) {
			return;
		}
		const username =
			window.location.pathname.match(/^\/user\/([^/]*)\/?/)[1];

		if (username !== this.#settings.anilistUser || !this.#layouts.preview) {
			return;
		}

		this.#handleAvatar(this.#layout.avatar);
		this.#handleBanner(this.#layout.banner);
		this.#handleColor(this.#layout.color);
		this.#handleDonatorBadge(this.#layout.donatorBadge);
		this.#handleCss();
		this.#handleAbout(Markdown.parse(this.#layout.bio ?? ""));
	}

	#handleBroadcastMessage(event) {
		switch (event.data.type) {
			case "preview":
				this.#handlePreviewToggleMessage(event.data.preview);
				break;
			case "layout":
				this.#handleLayoutMessage(event.data.layout);
				break;
			case "css":
				this.#handleCssMessage(event.data.disableCss);
				break;
		}
	}

	#handlePreviewToggleMessage(preview) {
		this.#layouts.preview = preview;
		if (
			preview ||
			!window.location.pathname.startsWith(
				`/user/${this.#settings.anilistUser}/`,
			)
		) {
			return;
		}

		this.#handleAvatar(this.#anilistSettings?.avatar?.large);
		this.#handleBanner(this.#anilistSettings?.bannerImage);
		this.#handleColor(this.#anilistSettings.options.profileColor);
		this.#handleDonatorBadge(this.#anilistSettings.donatorBadge);
		this.#layouts.disableCss = false;
		this.#handleCss();
		this.#handleAbout(this.#originalHtml);
	}

	#handleLayoutMessage(layout) {
		this.#layout = layout;
	}

	#handleCssMessage(disableCss) {
		this.#layouts.disableCss = disableCss;
	}

	#handleAvatar(avatar) {
		if (avatar === "") {
			return;
		}

		const avatarElement = document.querySelector("img.avatar");
		if (avatarElement.src !== avatar) {
			avatarElement.src = avatar;
		}

		const avatarLinks = document.querySelectorAll(
			`a.avatar[href*="${this.#settings.anilistUser}"]`,
		);
		for (const avatarLink of avatarLinks) {
			if (avatarLink.style !== `background-image: url(${avatar})`) {
				avatarLink.style = `background-image: url(${avatar})`;
			}
		}
	}

	#handleBanner(banner) {
		if (banner === "") {
			return;
		}

		const bannerElement = document.querySelector(".banner");
		if (bannerElement.style !== `background-image: url(${banner})`) {
			bannerElement.style = `background-image: url(${banner})`;
		}
	}

	#handleColor(value) {
		let color;
		try {
			color = ColorFunctions.handleAnilistColor(value);
		} catch (err) {
			return;
		}

		const pageContent = document.querySelector(".page-content > .user");
		pageContent.style.setProperty("--color-blue", color);
		pageContent.style.setProperty("--color-blue-dim", color);
	}

	#handleDonatorBadge(donatorText) {
		if (this.#donatorTier < 3 || donatorText === "") {
			return;
		}

		const donatorBadge = document.querySelector(".donator-badge");
		if (donatorBadge.innerText !== donatorText) {
			donatorBadge.innerText = donatorText;
		}
	}

	#handleCss() {
		if (this.#layouts.disableCss) {
			DOM.get("#verified-user-css-styles")?.setAttribute(
				"disabled",
				true,
			);
		} else {
			DOM.get("#verified-user-css-styles")?.removeAttribute("disabled");
		}
	}

	#handleAbout(about) {
		const aboutContainer = document.querySelector(".about .markdown");

		if (!aboutContainer) {
			return;
		}

		if (!this.#originalHtml) {
			this.#originalHtml = aboutContainer.innerHTML;
		}

		aboutContainer.innerHTML = about !== "" ? about : this.#originalHtml;
	}

	renderSettings(settingsUi) {
		if (!this.#settings.options.layoutDesignerEnabled.getValue()) {
			return "";
		}
		const container = DOM.create("div", "layout-designer-container");

		const header = DOM.create("h3", null, "Layout Designer");

		const layoutSelector = this.#createLayoutSelector(settingsUi);
		const layoutInfoSection = this.#layoutInfoSection(settingsUi);

		const imageSection = DOM.create("div");

		imageSection.append(
			this.#createImageField("avatar", this.#layout.avatar, settingsUi),
		);

		imageSection.append(
			this.#createImageField("banner", this.#layout.banner, settingsUi),
		);

		const imageUploadNote = Note(
			"You can preview avatar & banner by providing a link to an image. If you have configured a image host, you can upload images by pasting them to the fields. ",
		);

		imageUploadNote.append(
			DOM.create("br"),
			"Unfortunately AniList API does not support third parties uploading new avatars or banners. You have to upload them separately.",
		);

		const colorSelection = this.#createColorSelection(settingsUi);

		const previewButton = Button(
			this.#layouts.preview ? "Disable Preview" : "Enable Preview",
			() => {
				this.#togglePreview(settingsUi);
			},
		);

		const cssButton = Button(
			this.#layouts.disableCss ? "Enable Css" : "Disable Css",
			() => {
				this.#toggleCss();
				cssButton.innerText = this.#layouts.disableCss
					? "Enable Css"
					: "Disable Css";
			},
		);

		const getAboutButton = Button(
			"Reset About",
			() => {
				this.#getUserAbout(settingsUi);
			},
			"error",
		);

		container.append(
			header,
			layoutSelector,
			layoutInfoSection,
			imageSection,
			imageUploadNote,
			colorSelection,
		);

		if (this.#donatorTier >= 3) {
			container.append(this.#createDonatorBadgeField(settingsUi));
		}

		container.append(this.#createAboutSection(settingsUi), getAboutButton);

		if (this.#settings.auth?.token) {
			const saveAboutButton = Button(
				"Publish About",
				(event) => {
					this.#publishAbout(event, settingsUi);
				},
				"success",
			);
			container.append(saveAboutButton);
		}

		container.append(previewButton);

		if (this.#layouts.preview) {
			container.append(cssButton);
		}
		return container;
	}

	#createLayoutSelector(settingsUi) {
		const container = DOM.create("div");
		container.append(
			IconButton(AddIcon(), () => {
				this.#addLayout();
				settingsUi.renderSettingsUiContent();
			}),
		);
		const options = this.#layouts.layoutsList.map((layout, index) =>
			Option(
				`${layout.name} #${index + 1}`,
				index === this.#layouts.selectedLayout,
				() => {
					this.#switchLayout(index);
					settingsUi.renderSettingsUiContent();
				},
			),
		);

		container.append(Select(options));
		return container;
	}

	#switchLayout(index) {
		this.#layout = this.#layouts.layoutsList[index];
		this.#layouts.selectedLayout = index;
		this.#saveToLocalStorage();
		this.#broadcastLayoutChange();
	}

	#addLayout() {
		const layout = new Layout();
		this.#layout = layout;
		this.#layouts.layoutsList.push(layout);
		this.#layouts.selectedLayout = Math.max(
			this.#layouts.layoutsList.length - 1,
			0,
		);
		this.#saveToLocalStorage();
		this.#broadcastLayoutChange();
	}

	#deleteLayout() {
		if (!window.confirm("Are you sure you want to delete this layout?")) {
			return;
		}
		this.#layouts.layoutsList.splice(this.#layouts.selectedLayout, 1);
		this.#layouts.selectedLayout = Math.max(
			this.#layouts.selectedLayout - 1,
			0,
		);

		if (this.#layouts.layoutsList.length === 0) {
			this.#layouts.layoutsList.push(new Layout());
		}

		this.#layout = this.#layouts.layoutsList[this.#layouts.selectedLayout];
		this.#saveToLocalStorage();
		this.#broadcastLayoutChange();
	}

	#layoutInfoSection(settingsUi) {
		const container = Label(
			"Layout name",
			InputField(this.#layout?.name, (event) => {
				this.#updateOption("name", event.target.value, settingsUi);
			}),
		);

		container.append(
			IconButton(TrashcanIcon(), () => {
				this.#deleteLayout();
				settingsUi.renderSettingsUiContent();
			}),
		);
		return container;
	}

	#createInputField(field, value, settingsUi) {
		const input = InputField(value, (event) => {
			this.#updateOption(field, event.target.value, settingsUi);
		});
		return input;
	}

	#createImageField(field, value, settingsUi) {
		const container = DOM.create("div", "layout-image-container");
		const header = DOM.create("h5", "layout-header", field);
		const display = DOM.create("div", `layout-image-display ${field}`);
		display.style.backgroundImage = `url(${value})`;
		const input = this.#createInputField(field, value, settingsUi);

		container.append(header, display, input);
		return container;
	}

	#createDonatorBadgeField(settingsUi) {
		const container = DOM.create("div", "layout-donator-badge-container");
		const donatorHeader = DOM.create(
			"h5",
			"layout-header",
			"Donator Badge",
		);
		const donatorInput = InputField(this.#layout.donatorBadge, (event) => {
			this.#updateOption("donatorBadge", event.target.value, settingsUi);
		});
		donatorInput.setAttribute("maxlength", 24);

		container.append(donatorHeader, donatorInput);

		if (
			this.#layout.donatorBadge !== this.#anilistSettings.donatorBadge &&
			this.#layout.donatorBadge !== "" &&
			this.#settings.auth?.token
		) {
			const publishButton = Button("Publish Donator Badge", (event) => {
				this.#publishDonatorText(event, settingsUi);
			});
			container.append(DOM.create("div", null, publishButton));
		}

		return container;
	}

	#createColorSelection(settingsUi) {
		const container = DOM.create("div", "layout-color-selection");

		const header = DOM.create("h5", "layout-header", "Color");
		container.append(header);

		for (const anilistColor of ColorFunctions.defaultColors) {
			container.append(this.#createColorButton(anilistColor, settingsUi));
		}

		if (this.#donatorTier >= 2) {
			const isDefaultColor = ColorFunctions.defaultColors.some(
				(color) => color === this.#layout.color,
			);

			const colorInput = ColorPicker(
				isDefaultColor ? "" : this.#layout.color,
				(event) => {
					this.#updateOption("color", event.target.value, settingsUi);
				},
			);
			if (!isDefaultColor && this.#layout.color !== "") {
				colorInput.classList.add("active");
			}
			container.append(colorInput);
		}

		if (
			this.#settings.auth?.token &&
			this.#layout.color.toLocaleLowerCase() !==
				this.#anilistSettings?.options?.profileColor?.toLocaleLowerCase() &&
			this.#layout.color !== ""
		) {
			const publishButton = Button("Publish Color", (event) => {
				this.#publishColor(event, settingsUi);
			});
			container.append(DOM.create("div", null, publishButton));
		}

		return container;
	}

	#createAboutSection(settingsUi) {
		const container = DOM.create("div");
		const aboutHeader = DOM.create("h5", "layout-header", "About");
		const aboutInput = TextArea(this.#layout.bio, (event) => {
			this.#updateOption("bio", event.target.value, settingsUi);
		});
		const note = Note(
			"Please note that VoidVerified does not have access to AniList's markdown parser. AniList specific features might not be available while previewing. Recommended to be used for smaller changes like previewing a different image for a layout.",
		);

		container.append(aboutHeader, aboutInput, note);
		return container;
	}

	async #publishAbout(event, settingsUi) {
		const button = event.target;
		button.innerText = "Publishing...";

		try {
			const anilistAPI = new AnilistAPI(this.#settings);
			let currentAbout = await anilistAPI.getUserAbout(
				this.#settings.anilistUser,
			);
			if (!currentAbout) {
				currentAbout = "";
			}
			const about = this.#transformAbout(currentAbout, this.#layout.bio);

			await anilistAPI.saveUserAbout(about);
			Toaster.success("About published.");
			settingsUi.renderSettingsUiContent();
		} catch (error) {
			Toaster.error("Failed to publish about.", error);
		}
	}

	#transformAbout(currentAbout, newAbout) {
		const json = currentAbout.match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/)?.[1];

		if (!json) {
			return newAbout;
		}

		const about = `[](json${json})` + newAbout;
		return about;
	}

	async #publishColor(event, settingsUi) {
		const button = event.target;
		const color = this.#layout.color;
		button.innerText = "Publishing...";

		try {
			const anilistAPI = new AnilistAPI(this.#settings);
			const result = await anilistAPI.saveUserColor(color);
			const profileColor = result.UpdateUser?.options?.profileColor;
			this.#anilistSettings.options.profileColor = profileColor;
			Toaster.success("Color published.");
		} catch (error) {
			Toaster.error("Failed to publish color.", error);
		} finally {
			settingsUi.renderSettingsUiContent();
		}
	}

	async #publishDonatorText(event, settingsUi) {
		const button = event.target;
		const donatorText = this.#layout.donatorBadge;
		button.innerText = "Publishing...";

		try {
			const anilistAPI = new AnilistAPI(this.#settings);
			const result = await anilistAPI.saveDonatorBadge(donatorText);
			const donatorBadge = result.UpdateUser?.donatorBadge;
			this.#anilistSettings.donatorBadge = donatorBadge;
			Toaster.success("Donator badge published.");
		} catch (error) {
			Toaster.error("Failed to publish donator badge.", error);
		} finally {
			settingsUi.renderSettingsUiContent();
		}
	}

	async #getUserAbout(settingsUi) {
		if (
			this.#layout.bio !== "" &&
			!window.confirm(
				"Are you sure you want to reset about? Any changes will be lost.",
			)
		) {
			return;
		}

		try {
			Toaster.debug("Querying user about.");
			const anilistAPI = new AnilistAPI(this.#settings);
			const about = await anilistAPI.getUserAbout(
				this.#settings.anilistUser,
			);
			const clearedAbout = this.#removeJson(about);

			this.#updateOption("bio", clearedAbout, settingsUi);
			Toaster.success("About reset.");
		} catch (error) {
			Toaster.error("Failed to query current about from AniList API.", error);
		}
	}

	#removeJson(about) {
		return about.replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/, "");
	}

	#createColorButton(anilistColor, settingsUi) {
		const button = DOM.create("div", "color-button");
		button.style.backgroundColor = `rgb(${ColorFunctions.handleAnilistColor(
			anilistColor,
		)})`;

		button.addEventListener("click", () => {
			this.#updateOption("color", anilistColor, settingsUi);
		});

		if (this.#layout.color === anilistColor) {
			button.classList.add("active");
		}

		return button;
	}

	#updateOption(field, value, settingsUi) {
		this.#layout[field] = value;
		this.#updateLayout(this.#layout);
		settingsUi.renderSettingsUiContent();
	}

	#togglePreview(settingsUi) {
		this.#layouts.preview = !this.#layouts.preview;
		if (!this.#layouts.preview) {
			this.#layouts.disableCss = false;
		}
		this.#broadcastChannel.postMessage({
			type: "preview",
			preview: this.#layouts.preview,
		});
		this.#saveToLocalStorage();
		settingsUi.renderSettingsUiContent();
	}

	#toggleCss() {
		this.#layouts.disableCss = !this.#layouts.disableCss;
		this.#broadcastChannel.postMessage({
			type: "css",
			disableCss: this.#layouts.disableCss,
		});
		this.#saveToLocalStorage();
	}

	#getSelectedLayout() {
		return this.#layouts.layoutsList[this.#layouts.selectedLayout];
	}

	#updateLayout(layout) {
		this.#layouts.layoutsList[this.#layouts.selectedLayout] = layout;
		this.#saveToLocalStorage();
		this.#broadcastLayoutChange();
	}

	#broadcastLayoutChange() {
		this.#broadcastChannel.postMessage({
			type: "layout",
			layout: this.#layout,
		});
	}

	#saveToLocalStorage() {
		localStorage.setItem(
			this.#layoutsInLocalStorage,
			JSON.stringify(this.#layouts),
		);
	}
}
