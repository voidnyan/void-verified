import {ISettings} from "../types/settings";
import hotkeys from "../libraries/hotkeys";
import {ImageFormats} from "../assets/imageFormats";

export interface IMarkdownHotkeys {
	setupMarkdownHotkeys: () => void;
};

const wrapInputs = [
	{
		key: "ctrl+b",
		characters: "__"
	},
	{
		key: "ctrl+i",
		characters: "_"
	},
	{
		key: "alt+shift+5",
		characters: "~~"
	},
	{
		key: "alt+s",
		characters: ["~!", "!~"]
	},
	{
		key: "alt+shift+c",
		characters: "~~~"
	},
	{
		key: "ctrl+shift+c",
		characters: "`"
	},
	{
		key: "ctrl+shift+alt+c",
		characters: ["<pre>", "</pre>"]
	}
];

const lineStartInputs = [
	{
		key: "alt+q",
		characters: ">"
	},
	{
		key: "alt+h",
		characters: "#",
		maxInstances: 5
	}
];

const everyLineStartsInputs = [
	{
		key: "alt+b",
		characters: "-"
	},
	{
		key: "alt+l",
		characters: "1."
	},
]

const videoInputs  = [
	{
		key: "alt+y",
		characters: ["youtube(", ")"],
		regex: /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)/
	},
	{
		key: "alt+w",
		characters: ["webm(", ")"],
		regex: /^(https?:\/\/.*\.(?:webm|mp4))/
	}
]

export class MarkdownHotkeys implements IMarkdownHotkeys {
	settings: ISettings

	constructor(settings: ISettings) {
		this.settings = settings;
	}

	setupMarkdownHotkeys() {
		console.log(this.settings.options.markdownHotkeys.getValue())
		if (!this.settings.options.markdownHotkeys.getValue()) {
			return;
		}

		// @ts-ignore
		hotkeys.filter = (event) => {
			const target = event.target || event.srcElement;
			if (target.classList.contains("ace_text-input")) {
				return false;
			}
			return target.tagName === 'TEXTAREA';
		}

		for (const {key, characters} of wrapInputs) {
			hotkeys(key, (event) => {
				event.preventDefault();
				this.#wrapSelection(event.target, characters);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})
		}

		for (const {key, characters, maxInstances} of lineStartInputs) {
			hotkeys(key, (event) => {
				event.preventDefault();
				this.#insertAtLineStart(event.target, characters, maxInstances);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})

		}

		for (const {key, characters} of everyLineStartsInputs) {
			hotkeys(key, (event) => {
				event.preventDefault();
				this.#insertAtEveryLine(event.target, characters);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			})
		}

		for (const {key, characters, regex} of videoInputs) {
			hotkeys(key, (event) => {
				event.preventDefault();
				this.#wrapVideoLink(event.target, characters, regex);
				event.target.dispatchEvent(new Event('input', {bubbles: true}));
			});
		}

		this.#addWrapLinksHotkey();
		this.#addWrapImageHotkey();
	}

	#wrapSelection(textarea: HTMLTextAreaElement, characters: string | string[]) {
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

		const before = textarea.value.substring(0, start);
		const selection = textarea.value.substring(start, end);
		const after = textarea.value.substring(end);

		textarea.value = `${before}${startCharacters}${selection}${endCharacters}${after}`;

		textarea.selectionStart = start + startCharacters.length;
		textarea.selectionEnd = end + startCharacters.length;
	}

	#addWrapLinksHotkey() {
		hotkeys("ctrl+k", (event) => {
			event.preventDefault();
			const selectionStart = event.target.selectionStart;
			if (getSelection().toString().match(/(https?:\/\/[^\s]+)/gi)) {
				this.#wrapSelection(event.target, ["[](", ")"]);
				event.target.selectionStart = selectionStart + 1;
			} else {
				const selectionLength = event.target.selectionEnd - event.target.selectionStart;
				this.#wrapSelection(event.target, ["[", "]()"]);
				event.target.selectionStart = selectionStart + 3 + selectionLength;
			}
			event.target.selectionEnd = event.target.selectionStart;
			event.target.dispatchEvent(new Event('input', {bubbles: true}));
		});
	}

	#addWrapImageHotkey() {
		hotkeys("alt+i", (event) => {
			if (getSelection().toString().match(`(https?:\\/\\/.*\\.(?:${ImageFormats.join("|")}))`)) {
				event.preventDefault();
				const selectionStart = event.target.selectionStart;
				const imageWidth = this.settings.options.pasteImageWidth.getValue() as string;
				this.#wrapSelection(event.target, [`img${imageWidth}(`, ")"]);
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

	#insertAtStringStart(line: string, characters: string, maxInstances = 1): [string, number]{
		const lineStartsWithCharacters = line.charAt(0) === characters;
		const insertMultipleAllowed = maxInstances > 1;
		if (!insertMultipleAllowed && lineStartsWithCharacters) {
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
		for (const line of selection.split("\n")) {
			const [transformedLine, _selectionDifference] = this.#insertAtStringStart(line, characters, maxInstances);
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
