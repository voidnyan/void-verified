const markdownRegex = [
	{
		regex: /^##### (.*$)/gim,
		format: "<h5>$1</h5>",
	},
	{
		regex: /^#### (.*$)/gim,
		format: "<h4>$1</h4>",
	},
	{
		regex: /^### (.*$)/gim,
		format: "<h3>$1</h3>",
	},
	{
		regex: /^## (.*$)/gim,
		format: "<h2>$1</h2>",
	},
	{
		regex: /^# (.*$)/gim,
		format: "<h1>$1</h1>",
	},
	{
		regex: /\_\_(.*)\_\_/gim,
		format: "<strong>$1</strong>",
	},
	{
		regex: /\_(.*)\_/gim,
		format: "<em>$1</em>",
	},
	{
		regex: /(?:\r\n|\r|\n)/g,
		format: "<br>",
	},
	{
		regex: /\~~~(.*)\~~~/gim,
		format: "<center>$1</center>",
	},
	{
		regex: /\[([^\]]*)\]\(([^\)]+)\)/gi,
		format: "<a href='$2'>$1</a>",
	},
	{
		regex: /\~\!(.*)\!\~/gi,
		format: "<span class='markdown-spoiler'><span>$1</span></span>",
	},
	{
		regex: /img([0-9]+%?)\(([^\)]+)\)/g,
		format: "<img src='$2' width='$1' >",
	},
];

export class Markdown {
	static parse(markdown) {
		let html = markdown;
		for (const parser of markdownRegex) {
			html = html.replace(parser.regex, parser.format);
		}

		return html;
	}
}
