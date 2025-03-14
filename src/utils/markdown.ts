import {DOM} from "./DOM";

export class Markdown {
	static parse(markdown: string): string {
		let html = markdown;

		// Headers
		html = html.replace(/^#####(.*)$/gm, '<h5>$1</h5>');
		html = html.replace(/^####(.*)$/gm, '<h4>$1</h4>');
		html = html.replace(/^###(.*)$/gm, '<h3>$1</h3>');
		html = html.replace(/^##(.*)$/gm, '<h2>$1</h2>');
		html = html.replace(/^#(.*)$/gm, '<h1>$1</h1>');

		// Spoilers
		html = html.replace(/~!(.*?)!~/gs, '<p><span class="markdown-spoiler"><i class="hide-spoiler el-icon-circle-close"></i><span>$1</span></span></p>');

		// Blockquotes
		html = html.replace(/(^>.*(?:\n(?!\s*$).*)*)/gm, match => {
			return `<blockquote>${match.replace(/^>\s?/gm, '').trim()}</blockquote>`;
		});

		// Convert unordered lists (- or *) while allowing <br> between items
		html = html.replace(/(?:^|\n)([*-]) (.+(?:\n?(?:<br>\n?)?[*-] .+)*)/gm, (match, bullet, items) => {
			const listItems = items
				.split(/\n?(?:<br>\n?)?[*-] /g) // Split by newline or <br> followed by another list item
				.map(item => `<li>${item.trim()}</li>`)
				.join('');
			return `<ul>${listItems}</ul>`;
		});

		// Convert ordered lists (1. 2. ...) while allowing <br> between items
		html = html.replace(/(?:^|\n)(\d+)\. (.+(?:\n?(?:<br>\n?)?\d+\. .+)*)/gm, (match, number, items) => {
			const listItems = items
				.split(/\n?(?:<br>\n?)?\d+\. /g) // Split by newline or <br> followed by another numbered item
				.map(item => `<li>${item.trim()}</li>`)
				.join('');
			return `<ol>${listItems}</ol>`;
		});

		// Wrap consecutive text blocks in <p> tags (treating double newlines as paragraph breaks)
		html = html.replace(/\n{2,}/g, '</p><p>');


		// Line Breaks
		// html = html.replace(/(?<!<br>)\n(?!<br>)/g, '<br>');
		html = html.replace(/\n/g, '<br>');

		// Images
		html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img alt="$1" src="$2" />');
		html = html.replace(/img(\d+%?)\(([^)]+)\)/g, function (_, width, url) {
			const unit = width.endsWith("%") ? "%" : "px";
			return `<img src="${url}" width="${width}" />`;
		});
		html = html.replace(/img\(([^)]+)\)/g, '<img src="$1" />');

		// Links
		html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

		// Bold & Italic
		html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
		html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
		html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
		html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

		// Center
		html = html.replace(/~~~(.*?)~~~/gs, '<center>$1</center>');

		// Strikethrough
		html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

		// Inline Code
		html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

		// Code Blocks
		html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');


		// YouTube Embeds
		html = html.replace(/youtube\(([^)]+)\)/g, (_, src) => {
			const id = this.getYoutubeVideoId(src);
			if (!id) {
				return "";
			}
			return `<span class="youtube" id="${id}" style="background-image: url(&quot;https://i.ytimg.com/vi/${id}/hqdefault.jpg&quot;); background-position: center center; background-repeat: no-repeat; background-size: cover;"><span class="play"></span></span>`;
		});

		// WebM Embeds
		html = html.replace(/webm\(([^)]+)\)/g, '<video autoplay loop muted controls><source src="$1" type="video/webm"></video>');

		// Horizontal Rules
		html = html.replace(/---/g, '<hr>');

		// tags: @voidnyan -> /user/voidnyan/
		html = html.replace(/(^|\s)@([a-zA-Z0-9_]+)(?![^<]*>)/g, '$1<a href="/user/$2/">@$2</a>');

		// Add <p> tags at the beginning and end of the entire content
		html = `<p>${html.trim()}</p>`;

		// @ts-ignore
		html = DOMPurify.sanitize(html);

		return html;
	}

	static applyFunctions(markdownElement: HTMLDivElement) {
		for (const spoiler of markdownElement.querySelectorAll(".markdown-spoiler")) {
			spoiler.addEventListener("click", (e) => {
				e.stopPropagation();
				spoiler.classList.add("spoiler-visible");
			});
			spoiler.querySelector("i").addEventListener("click", (e) => {
				e.stopPropagation();
				spoiler.classList.remove("spoiler-visible");
			});
		}

		for (const youtube of markdownElement.querySelectorAll(".youtube")) {
			youtube.addEventListener("click", () => {
				const id = youtube.id;
				const iframe = DOM.create("iframe");
				iframe.setAttribute("frameborder", 0);
				iframe.setAttribute("src", `https://www.youtube.com/embed/${id}?autoplay=1&autohide=1`);
				youtube.replaceChildren(iframe);
			});
		}

		for (const anchor of markdownElement.querySelectorAll("a")) {
			anchor.setAttribute("target", "_blank");
		}
	}

	private static getYoutubeVideoId(url: string) {
		const pattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S*\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(pattern);
		return match ? match[1] : null;
	}
}
