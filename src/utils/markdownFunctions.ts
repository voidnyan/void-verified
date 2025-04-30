import {StaticSettings} from "./staticSettings";
import {PasteHandler} from "../handlers/pasteHandler";

export enum InputType {
	Wrap,
	LineStart,
	EveryLineStart,
	Video,
	Link,
	Image
}

export interface IInputMapping {
	key: string,
	characters?: string | string[],
	specialRemove?: string,
	description: string,
	type: InputType,
	regex?: RegExp,
	maxInstances?: number
}

export const MarkdownCommands: IInputMapping[] = [
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
		description: "Italic",
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
		description: "Spoiler!",
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
		description: "Youtube Video",
		type: InputType.Video
	},
	{
		key: "alt+w",
		characters: ["webm(", ")"],
		regex: /^(https?:\/\/.*\.(?:webm|mp4))/,
		description: "WebM Video",
		type: InputType.Video
	},
	{
		key: "ctrl+k",
		description: "Link",
		type: InputType.Link
	},
	{
		key: "alt+i",
		description: "Image",
		type: InputType.Image
	}
];

export class MarkdownFunctions {
	static handleCommand(command: IInputMapping, textarea: HTMLTextAreaElement) {
		switch (command.type) {
			case InputType.Wrap:
				this.wrapSelection(textarea, command.characters, command.specialRemove);
				break;
			case InputType.LineStart:
				this.lineStart(textarea, command.characters as string, command.maxInstances ?? 1);
				break;
			case InputType.EveryLineStart:
				this.insertAtEveryLine(textarea, command.characters as string);
				break;
			case InputType.Video:
				this.wrapVideoLink(textarea, command.characters as string[], command.regex);
				break;
			case InputType.Image:
				this.wrapImage(textarea);
				break;
			case InputType.Link:
				this.wrapLink(textarea);
				break;
		}
	}

	static lineStart(textarea: HTMLTextAreaElement, characters: string, maxInstances = 1) {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const lineStart = textarea.value.substring(0, start).lastIndexOf("\n") + 1;

		const before = textarea.value.substring(0, lineStart);
		const [after, selectionDifference] = this.stringStart(textarea.value.substring(lineStart), characters, maxInstances);

		textarea.value = `${before}${after}`;
		textarea.selectionStart = start + selectionDifference;
		textarea.selectionEnd = end + selectionDifference;
	}

	static stringStart(line: string, characters: string, maxInstances = 1, allowRemove = true): [string, number] {
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

	static insertAtEveryLine(textarea: HTMLTextAreaElement, characters: string, maxInstances = 1) {
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
			const [transformedLine, _selectionDifference] = this.stringStart(line, characters, maxInstances, false);
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

	static wrapSelection(textarea: HTMLTextAreaElement, characters: string | string[], specialRemove?: string, isCancellable = true) {
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

		if (isCancellable &&  (after.match(this.createRegex(endCharacters)) && before.match(this.createEndRegex(startCharacters)) ||
			specialRemove && (after.match(this.createRegex(specialRemove)) || before.match(this.createEndRegex(specialRemove))))) {
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

	static createRegex(startString: string) {
		const escapedStartString = startString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const lastChar = escapedStartString.slice(-1);
		const regexPattern = `^${escapedStartString}(?!${lastChar})`;
		return new RegExp(regexPattern);
	}

	static createEndRegex(endString) {
		const escapedEndString = endString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const firstChar = escapedEndString.charAt(0);
		const regexPattern = `(?<!${firstChar}.{0})${escapedEndString}$`;
		return new RegExp(regexPattern);
	}

	static wrapVideoLink(textarea: HTMLTextAreaElement, characters: string[], regex: RegExp) {
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

	static wrapLink(textarea: HTMLTextAreaElement) {
		const selectionStart = textarea.selectionStart;
		if (getSelection().toString().match(/(https?:\/\/[^\s]+)/gi)) {
			MarkdownFunctions.wrapSelection(textarea, ["[](", ")"], null, false);
			textarea.selectionStart = selectionStart + 1;
		} else {
			const selectionLength = textarea.selectionEnd - textarea.selectionStart;
			MarkdownFunctions.wrapSelection(textarea, ["[", "]()"], null, false);
			textarea.selectionStart = selectionStart + 3 + selectionLength;
		}
		textarea.selectionEnd = textarea.selectionStart;
		textarea.dispatchEvent(new Event('input', {bubbles: true}));
	}

	static wrapImage(textarea: HTMLTextAreaElement) {
		const selectionStart = textarea.selectionStart;
		const imageWidth = PasteHandler.getImageWidth();
		this.wrapSelection(textarea, [`img${imageWidth}(`, ")"], null, false);
		textarea.selectionStart = selectionStart + 3 + imageWidth.length;
		textarea.selectionEnd = selectionStart + 3 + imageWidth.length;
		textarea.dispatchEvent(new Event('input', {bubbles: true}));
	}
}
