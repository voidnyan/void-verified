import {ISettings} from "../types/settings";
import hotkeys from "../libraries/hotkeys";
import {ImageFormats} from "../assets/imageFormats";
import {Button, IconButton, InputField, KeyInput} from "../components/components";
import {MapIcon} from "../assets/icons";
import {DOM} from "../utils/DOM";

export interface IMarkdownHotkeys {
	config: IMarkdownHotkeysConfig;
	setupMarkdownHotkeys: () => void;
	renderSettings: () => void;
};

enum InputType {
	Wrap,
	LineStart,
	EveryLineStart,
	Video,
	Custom
}

interface IInputMapping {
	key: string,
	characters?: string | string[],
	specialRemove?: string,
	description: string,
	type: InputType,
	regex?: RegExp,
	maxInstances?: number
}

const defaultInputs: IInputMapping[] = [
	{
		key: "ctrl+b",
		characters: "__",
		specialRemove: "___",
		description: "Bold",
		type: InputType.Wrap
	},
	{
		key: "ctrl+i",
		characters: "_",
		specialRemove: "___",
		description: "Italics",
		type: InputType.Wrap
	},
	{
		key: "alt+shift+5",
		characters: "~~",
		specialRemove: "~~~~~",
		description: "Strikethrough",
		type: InputType.Wrap
	},
	{
		key: "alt+S",
		characters: ["~!", "!~"],
		description: "Spoiler",
		type: InputType.Wrap
	},
	{
		key: "alt+shift+c",
		characters: "~~~",
		specialRemove: "~~~~~",
		description: "Center",
		type: InputType.Wrap
	},
	{
		key: "ctrl+shift+c",
		characters: "`",
		description: "Code",
		type: InputType.Wrap
	},
	{
		key: "ctrl+shift+alt+c",
		characters: ["<pre>", "</pre>"],
		description: "Code block",
		type: InputType.Wrap
	},

	{
		key: "alt+q",
		characters: ">",
		description: "Quote",
		type: InputType.LineStart
	},
	{
		key: "alt+h",
		characters: "#",
		maxInstances: 5,
		description: "Header",
		type: InputType.LineStart
	},
	{
		key: "alt+b",
		characters: "-",
		description: "Unordered List",
		type: InputType.EveryLineStart
	},
	{
		key: "alt+l",
		characters: "1.",
		description: "Ordered List",
		type: InputType.EveryLineStart
	},
	{
		key: "alt+y",
		characters: ["youtube(", ")"],
		regex: /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)/,
		description: "Youtube",
		type: InputType.Video
	},
	{
		key: "alt+w",
		characters: ["webm(", ")"],
		regex: /^(https?:\/\/.*\.(?:webm|mp4))/,
		description: "Webm",
		type: InputType.Video
	},
	{
		key: "ctrl+k",
		description: "Link",
		type: InputType.Custom
	},
	{
		key: "alt+i",
		description: "Image",
		type: InputType.Custom
	}
];

const scope = "markdown";

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
			const target = event.target || event.srcElement;
			if (target.classList.contains("ace_text-input")) {
				return false;
			}
			if (target.classList.contains("void-key-input")) {
				return true;
			}
			return target.tagName === 'TEXTAREA';
		}

		// @ts-ignore
		hotkeys.deleteScope(scope);
		// @ts-ignore
		hotkeys.setScope(scope);

		for (const {key, characters, specialRemove} of this.config.getMappings(InputType.Wrap)) {
			hotkeys(key, scope, (event) => {
				event.preventDefault();
				this.#wrapSelection(event.target, characters, specialRemove);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})
		}

		for (const {key, characters, maxInstances} of this.config.getMappings(InputType.LineStart)) {
			hotkeys(key, scope, (event) => {
				event.preventDefault();
				this.#insertAtLineStart(event.target, characters as string, maxInstances);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})

		}

		for (const {key, characters} of this.config.getMappings(InputType.EveryLineStart)) {
			hotkeys(key, scope, (event) => {
				event.preventDefault();
				this.#insertAtEveryLine(event.target, characters as string);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})
		}

		for (const {key, characters, regex} of this.config.getMappings(InputType.Video)) {
			hotkeys(key, scope, (event) => {
				event.preventDefault();
				this.#wrapVideoLink(event.target, characters as string[], regex);
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
			hotkeys("*", {element: inputField, scope: "markdown-mapping"}, () => {
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


	#wrapSelection(textarea: HTMLTextAreaElement, characters: string | string[], specialRemove?: string, isCancellable = true) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		let startCharacters: string;
		let endCharacters: string;

		if (Array.isArray(characters)) {
			startCharacters = characters[0];
			endCharacters = characters[1];
		} else {
			startCharacters = characters;
			endCharacters = characters;
		}

		let before = textarea.value.substring(0, start);
		const selection = textarea.value.substring(start, end);
		let after = textarea.value.substring(end);

		if (isCancellable &&  (after.match(this.#createRegex(endCharacters)) && before.match(this.#createEndRegex(startCharacters)) ||
			specialRemove && (after.match(this.#createRegex(specialRemove)) || before.match(this.#createEndRegex(specialRemove))))) {
			before = before.substring(0, before.length - startCharacters.length);
			after = after.substring(endCharacters.length);
			textarea.value = `${before}${selection}${after}`;
			textarea.selectionStart = start - startCharacters.length;
			textarea.selectionEnd = end - startCharacters.length;
			return;
		}


		textarea.value = `${before}${startCharacters}${selection}${endCharacters}${after}`;
		textarea.selectionStart = start + startCharacters.length;
		textarea.selectionEnd = end + startCharacters.length;
	}

	#createRegex(startString: string) {
		const escapedStartString = startString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const lastChar = escapedStartString.slice(-1);
		const regexPattern = `^${escapedStartString}(?!${lastChar})`;
		return new RegExp(regexPattern);
	}

	#createEndRegex(endString) {
		const escapedEndString = endString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const firstChar = escapedEndString.charAt(0);
		const regexPattern = `(?<!${firstChar}.{0})${escapedEndString}$`;
		return new RegExp(regexPattern);
	}

	#addWrapLinksHotkey() {
		const mapping = this.config.getMapping("Link");
		hotkeys(mapping.key, scope, (event) => {
			event.preventDefault();
			const selectionStart = event.target.selectionStart;
			if (getSelection().toString().match(/(https?:\/\/[^\s]+)/gi)) {
				this.#wrapSelection(event.target, ["[](", ")"], null, false);
				event.target.selectionStart = selectionStart + 1;
			} else {
				const selectionLength = event.target.selectionEnd - event.target.selectionStart;
				this.#wrapSelection(event.target, ["[", "]()"], null, false);
				event.target.selectionStart = selectionStart + 3 + selectionLength;
			}
			event.target.selectionEnd = event.target.selectionStart;
			event.target.dispatchEvent(new Event('input', {bubbles: true}));
		});
	}

	#addWrapImageHotkey() {
		const mapping = this.config.getMapping("Image");
		hotkeys(mapping.key, scope, (event) => {
			if (getSelection().toString().match(`(https?:\\/\\/.*\\.(?:${ImageFormats.join("|")}))`)) {
				event.preventDefault();
				const selectionStart = event.target.selectionStart;
				const imageWidth = this.settings.options.pasteImageWidth.getValue() as string;
				this.#wrapSelection(event.target, [`img${imageWidth}(`, ")"], null, false);
				event.target.selectionStart = selectionStart + 3 + imageWidth.length;
				event.target.selectionEnd = selectionStart + 3 + imageWidth.length;
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			}
		});
	}

	#insertAtLineStart(textarea: HTMLTextAreaElement, characters: string, maxInstances = 1) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const lineStart = textarea.value.substring(0, start).lastIndexOf("\n") + 1;

		const before = textarea.value.substring(0, lineStart);
		const [after, selectionDifference] = this.#insertAtStringStart(textarea.value.substring(lineStart), characters, maxInstances);

		textarea.value = `${before}${after}`;
		textarea.selectionStart = start + selectionDifference;
		textarea.selectionEnd = end + selectionDifference;
	}

	#insertAtStringStart(line: string, characters: string, maxInstances = 1, allowRemove = true): [string, number] {
		const lineStartsWithCharacters = line.substring(0, characters.length) === characters;
		const insertMultipleAllowed = maxInstances > 1;
		if (!insertMultipleAllowed && lineStartsWithCharacters) {
			if (allowRemove) {
				const difference = characters.length + 1;
				return [line.substring(difference), -difference];
			}

			return [line, 0];
		}
		const countOfCharactersAtStartOfLine = line.search(`[^${characters}]`);
		if (countOfCharactersAtStartOfLine >= maxInstances) {
			return [line, 0];
		}

		const selectionDifference = characters.length + (!lineStartsWithCharacters ? 1 : 0);
		return [`${characters}${!lineStartsWithCharacters ? " " : ""}${line}`, selectionDifference];
	}

	#insertAtEveryLine(textarea: HTMLTextAreaElement, characters: string, maxInstances = 1) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		const firstLineStart = textarea.value.substring(0, start).lastIndexOf("\n") + 1;
		const before = textarea.value.substring(0, firstLineStart);
		const selection = textarea.value.substring(firstLineStart, end);
		const afterSelection = textarea.value.substring(end);

		const result: string[] = [];
		let selectionDifference = 0;
		let firstLineHandled = false;
		let selectionStartDifference = 0;
		const selectionStartsWithCharacters = selection.substring(0, characters.length) === characters;
		for (const line of selection.split("\n")) {
			if (selectionStartsWithCharacters) {
				if (line.substring(0, characters.length) !== characters) {
					result.push(line);
					continue;
				}
				const difference = characters.length + 1;
				const transformedLine = line.substring(difference);
				result.push(transformedLine);
				selectionDifference -= difference;
				continue;
			}
			const [transformedLine, _selectionDifference] = this.#insertAtStringStart(line, characters, maxInstances, false);
			result.push(transformedLine);
			selectionDifference += _selectionDifference;
			if (!firstLineHandled) {
				selectionStartDifference += _selectionDifference;
				firstLineHandled = true;
			}
		}

		textarea.value = `${before}${result.join("\n")}${afterSelection}`;
		textarea.selectionStart = start;
		textarea.selectionEnd = end + selectionDifference;
	}

	#wrapVideoLink(textarea: HTMLTextAreaElement, characters: string[], regex: RegExp) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const before = textarea.value.substring(0, start);
		const selection = textarea.value.substring(start, end);
		const afterSelection = textarea.value.substring(end);

		if (!selection.match(regex)) {
			return;
		}

		textarea.value = `${before}${characters[0]}${selection}${characters[1]}${afterSelection}`;
		textarea.selectionStart = start + characters[0].length;
		textarea.selectionEnd = end + characters[0].length;
	}
}
