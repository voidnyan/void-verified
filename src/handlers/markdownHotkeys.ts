import {ISettings} from "../types/settings";
import hotkeys from "../libraries/hotkeys";
import {ImageFormats} from "../assets/imageFormats";
import {Button, IconButton, InputField, KeyInput} from "../components/components";
import {MapIcon} from "../assets/icons";
import {DOM} from "../utils/DOM";
import {IInputMapping, InputType, MarkdownCommands, MarkdownFunctions} from "../utils/markdownFunctions";

export interface IMarkdownHotkeys {
	config: IMarkdownHotkeysConfig;
	setupMarkdownHotkeys: () => void;
	renderSettings: () => void;
};


const scope = "markdown";
const defaultInputs = MarkdownCommands;

interface IMarkdownHotkeysConfig {
	// mappings: IInputMapping[],
	getMappings: (type: InputType) => IInputMapping[];
	getAllMappings: () => IInputMapping[];
	getMapping: (description: string) => IInputMapping;
	saveMapping: (key: string, mappingDescription: string) => void;
	resetMappings: () => void;
}

class MarkdownHotkeysConfig implements IMarkdownHotkeysConfig {
	mappings: IInputMapping[];

	constructor() {
		const localStorageConfig = JSON.parse(localStorage.getItem("void-markdown-hotkeys"));
		this.mappings = localStorageConfig?.mappings ?? defaultInputs;
	}

	getMappings(type: InputType) {
		return this.mappings.filter(mapping => mapping.type === type);
	}

	getAllMappings() {
		return this.mappings;
	}

	getMapping(description: string) {
		return this.mappings.find(mapping => mapping.description === description);
	}

	saveMapping(key: string, mappingDescription: string) {
		this.mappings = this.mappings.map(mapping => mappingDescription === mapping.description ? {
			...mapping,
			key
		} : mapping);
		this.#save();
	}

	resetMappings() {
		this.mappings = defaultInputs;
		this.#save();
	}

	#save() {
		localStorage.setItem("void-markdown-hotkeys", JSON.stringify(this));
	}
}

const filter = (event) => {
	const target = event.target || event.srcElement;
	if (target.classList.contains("ace_text-input")) {
		return false;
	}
	if (target.classList.contains("void-key-input")) {
		return true;
	}
	return target.tagName === 'TEXTAREA';
}

export class MarkdownHotkeys implements IMarkdownHotkeys {
	settings: ISettings
	config: IMarkdownHotkeysConfig;

	constructor(settings: ISettings) {
		this.settings = settings;
		this.config = new MarkdownHotkeysConfig();
	}

	setupMarkdownHotkeys() {
		if (!this.settings.options.markdownHotkeys.getValue()) {
			return;
		}

		// @ts-ignore
		hotkeys.filter = (event) => {
			return true;
		}

		// @ts-ignore
		hotkeys.deleteScope(scope);
		// @ts-ignore
		hotkeys.setScope(scope);

		for (const {key, characters, specialRemove} of this.config.getMappings(InputType.Wrap)) {
			hotkeys(key, scope, (event) => {
				event.preventDefault();
				if (!filter(event)) {
					return;
				}
				MarkdownFunctions.wrapSelection(event.target, characters, specialRemove);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})
		}

		for (const {key, characters, maxInstances} of this.config.getMappings(InputType.LineStart)) {
			hotkeys(key, scope, (event) => {
				if (!filter(event)) {
					return;
				}
				event.preventDefault();
				MarkdownFunctions.lineStart(event.target, characters as string, maxInstances);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})

		}

		for (const {key, characters} of this.config.getMappings(InputType.EveryLineStart)) {
			hotkeys(key, scope, (event) => {
				if (!filter(event)) {
					return;
				}
				event.preventDefault();
				MarkdownFunctions.insertAtEveryLine(event.target, characters as string);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})
		}

		for (const {key, characters, regex} of this.config.getMappings(InputType.Video)) {
			hotkeys(key, scope, (event) => {
				if (!filter(event)) {
					return;
				}
				event.preventDefault();
				MarkdownFunctions.wrapVideoLink(event.target, characters as string[], regex);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			});
		}

		this.#addWrapLinksHotkey();
		this.#addWrapImageHotkey();
	}

	renderSettings() {
		if (!this.settings.options.markdownHotkeys.getValue()) {
			return;
		}

		const markdownEditors = document.querySelectorAll(".markdown-editor");

		for (const markdownEditor of markdownEditors) {
			this.#renderSettingAndButton(markdownEditor);
		}
	}

	#renderSettingAndButton(markdownEditor: Element) {
		if (markdownEditor.querySelector(".void-markdown-keybinds")) {
			return;
		}

		const settingsContainer = this.#createSettingsContainer();

		const keybindsButton = IconButton(MapIcon(), () => {
			const closed = settingsContainer.getAttribute("closed") === "true";
			settingsContainer.setAttribute("closed", (!closed).toString());
		}, "gif-button markdown-keybinds");
		keybindsButton.setAttribute("title", "Shortcuts");
		markdownEditor.append(keybindsButton);
		const parent = markdownEditor.parentNode;
		parent.insertBefore(settingsContainer, parent.querySelector(".input"));
	}

	#createSettingsContainer(): Element {
		const container = DOM.create("div", "markdown-dialog-container");
		container.setAttribute("closed", true);
		const header = DOM.create("div", "markdown-dialog-header", "Shortcuts");
		const body = this.#createSettingsContainerBody();
		container.append(header, body);
		return container;
	}

	#createSettingsContainerBody() {
		const body = DOM.create("div", "markdown-dialog-body");
		const grid = DOM.create("div", "markdown-shortcut-dialog");
		body.append(grid);

		for (const input of this.config.getAllMappings()) {
			const inputField = KeyInput(input.key, "markdown-mapping", () => {
				this.setupMarkdownHotkeys();
			});
			hotkeys("*", {element: inputField, scope: "markdown-mapping"}, (event) => {
				if (!filter(event)) {
					return;
				}
				// @ts-ignore
				const keys = hotkeys.getPressedKeyString();
				inputField.value = keys.join("+");
				this.config.saveMapping(keys.join("+"), input.description);
			});
			grid.append(DOM.create("span", null, input.description), inputField);
		}

		const resetButton = Button("Reset mappings", () => {
			if (window.confirm("Are you sure you want to reset mappings to default?")) {
				this.config.resetMappings();
				body.replaceWith(this.#createSettingsContainerBody());
			}
		});
		body.append(resetButton);
		return body;
	}

	#addWrapLinksHotkey() {
		const mapping = this.config.getMapping("Link");
		hotkeys(mapping.key, scope, (event) => {
			if (!filter(event)) {
				return;
			}
			event.preventDefault();
			MarkdownFunctions.wrapLink(event.target);
		});
	}

	#addWrapImageHotkey() {
		const mapping = this.config.getMapping("Image");
		hotkeys(mapping.key, scope, (event) => {
			if (!filter(event)) {
				return;
			}
			if (getSelection().toString().match(`(https?:\\/\\/.*\\.(?:${ImageFormats.join("|")}))`)) {
				event.preventDefault();
				MarkdownFunctions.wrapImage(event.target);
			}
		});
	}
}
