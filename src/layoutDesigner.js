import { DOM } from "./helpers/DOM";
import { ColorFunctions } from "./colorFunctions";
import { Button, ColorPicker, InputField } from "./components/components";
import { AnilistAPI } from "./api/anilistAPI";

class Layout {
	avatar;
	banner;
	bio;
	color;
	donatorBadge;

	constructor(layout) {
		this.avatar = layout?.avatar ?? "";
		this.banner = layout?.banner ?? "";
		this.bio = layout?.bio ?? "";
		this.color = layout?.color ?? "";
		this.donatorBadge = layout?.donatorBadge ?? "";
	}
}

export class LayoutDesigner {
	#settings;
	#layoutsInLocalStorage = "void-verified-layouts";
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
			this.#handleBroadcastMessage(event)
		);

		const layouts = JSON.parse(
			localStorage.getItem(this.#layoutsInLocalStorage)
		);
		if (layouts) {
			this.#layouts = layouts;
			this.#layouts.layoutsList = layouts.layoutsList.map(
				(layout) => new Layout(layout)
			);
		}

		this.#anilistSettings = JSON.parse(localStorage.getItem("auth"));

		this.#donatorTier = this.#anilistSettings?.donatorTier;
		this.#layout = this.#getSelectedLayout();
	}

	renderLayoutPreview() {
		if (!window.location.pathname.startsWith("/user/")) {
			return;
		}
		const username =
			window.location.pathname.match(/^\/user\/([^/]*)\/?/)[1];

		if (username !== this.#settings.anilistUser || !this.#layouts.preview) {
			return;
		}

		// TODO: handle these with pure css which can be easily enabled or disabled
		// or actually, the user's things should mostly be in localStorage already, set there by anilist itself
		this.#handleAvatar(this.#layout.avatar);
		this.#handleBanner(this.#layout.banner);
		this.#handleColor(this.#layout.color);
		this.#handleDonatorBadge(this.#layout.donatorBadge);
		this.#handleCss();
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
		if (preview) {
			return;
		}

		this.#handleAvatar(this.#anilistSettings?.avatar?.large);
		this.#handleBanner(this.#anilistSettings?.bannerImage);
		this.#handleColor(this.#anilistSettings.options.profileColor);
		this.#handleDonatorBadge(this.#anilistSettings.donatorBadge);
		this.#layouts.disableCss = false;
		this.#handleCss();
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

		const avatarElement = DOM.get("img.avatar");
		avatarElement.src = avatar;

		const avatarLinks = DOM.getAll(
			`a.avatar[href*="${this.#settings.anilistUser}"]`
		);
		for (const avatarLink of avatarLinks) {
			avatarLink.style = `background-image: url(${avatar})`;
		}
	}

	#handleBanner(banner) {
		if (banner === "") {
			return;
		}

		const bannerElement = DOM.get(".banner");
		bannerElement.style = `background-image: url(${banner})`;
	}

	#handleColor(value) {
		let color;
		try {
			color = ColorFunctions.handleAnilistColor(value);
		} catch (err) {
			return;
		}

		const pageContent = DOM.get(".page-content > .user");
		pageContent.style.setProperty("--color-blue", color);
		pageContent.style.setProperty("--color-blue-dim", color);
		pageContent.style.setProperty("--color-logo", `rgb(${color})`);
	}

	#handleDonatorBadge(donatorText) {
		if (this.#donatorTier < 3 || donatorText === "") {
			return;
		}

		const donatorBadge = DOM.get(".donator-badge");
		donatorBadge.innerText = donatorText;
	}

	#handleCss() {
		if (this.#layouts.disableCss) {
			DOM.get("#void-verified-user-css-styles")?.setAttribute(
				"disabled",
				true
			);
		} else {
			DOM.get("#void-verified-user-css-styles")?.removeAttribute(
				"disabled"
			);
		}
	}

	renderSettings(settingsUi) {
		const container = DOM.create("div", "layout-designer-container");

		const header = DOM.create("h3", null, "Layout Designer");

		const avatarInput = this.#createImageField(
			"avatar",
			this.#layout.avatar,
			settingsUi
		);

		const bannerInput = this.#createImageField(
			"banner",
			this.#layout.banner,
			settingsUi
		);

		const colorSelection = this.#createColorSelection(settingsUi);

		const aboutHeader = DOM.create("h5", "layout-header", "About");
		const aboutInput = DOM.create("textarea");
		aboutInput.addEventListener("change", (event) => {
			this.#updateOption("bio", event.target.value, settingsUi);
		});
		aboutInput.value = this.#layout.bio;

		const previewButton = DOM.create(
			"button",
			null,
			this.#layouts.preview ? "Disable Preview" : "Enable Preview"
		);

		previewButton.classList.add("button");
		previewButton.addEventListener("click", () => {
			this.#togglePreview(settingsUi);
		});

		const cssButton = DOM.create(
			"button",
			null,
			this.#layouts.disableCss ? "Enable Css" : "Disable Css"
		);

		cssButton.classList.add("button");
		cssButton.addEventListener("click", () => {
			this.#toggleCss();
			cssButton.innerText = this.#layouts.disableCss
				? "Enable Css"
				: "Disable Css";
		});

		container.append(header, avatarInput, bannerInput, colorSelection);

		if (this.#donatorTier >= 3) {
			container.append(this.#createDonatorBadgeField(settingsUi));
		}

		container.append(
			// aboutHeader, aboutInput,
			previewButton
		);

		if (this.#layouts.preview) {
			container.append(cssButton);
		}
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
			"Donator Badge"
		);
		const donatorInput = InputField(this.#layout.donatorBadge, (event) => {
			this.#updateOption("donatorBadge", event.target.value, settingsUi);
		});
		donatorInput.setAttribute("maxlength", 24);

		container.append(donatorHeader, donatorInput);

		if (
			this.#layout.donatorBadge !== this.#anilistSettings.donatorBadge &&
			this.#layout.donatorBadge !== ""
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
				(color) => color === this.#layout.color
			);

			const colorInput = ColorPicker(
				isDefaultColor ? "" : this.#layout.color,
				(event) => {
					this.#updateOption("color", event.target.value, settingsUi);
				}
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

	async #publishColor(event, settingsUi) {
		const button = event.target;
		const color = this.#layout.color;
		button.innerText = "Publishing...";

		try {
			const anilistAPI = new AnilistAPI(this.#settings);
			const result = await anilistAPI.saveUserColor(color);
			const profileColor = result.UpdateUser?.options?.profileColor;
			this.#anilistSettings.options.profileColor = profileColor;
		} catch {
		} finally {
			settingsUi.renderSettingsUi();
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
		} catch {
		} finally {
			settingsUi.renderSettingsUi();
		}
	}

	#createColorButton(anilistColor, settingsUi) {
		const button = DOM.create("div", "color-button");
		button.style.backgroundColor = `rgb(${ColorFunctions.handleAnilistColor(
			anilistColor
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
		settingsUi.renderSettingsUi();
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
		settingsUi.renderSettingsUi();
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
		this.#broadcastChannel.postMessage({
			type: "layout",
			layout: this.#layout,
		});
	}

	#saveToLocalStorage() {
		localStorage.setItem(
			this.#layoutsInLocalStorage,
			JSON.stringify(this.#layouts)
		);
	}
}
