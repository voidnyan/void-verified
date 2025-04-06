const { author, repository, version } = require("../package.json");

module.exports = {
	name: {
		$: "VoidVerified",
	},
	namespace: "http://tampermonkey.net/",
	version: version,
	author: author,
	source: repository.url,
	license: 'MIT',
	description: "Social enhancements for AniList.",
	match: ["https://anilist.co/*"],
	require: [
		// `https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js`
		"https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.4/purify.min.js"
	],
	grant: ["GM.xmlHttpRequest"],
};
//
