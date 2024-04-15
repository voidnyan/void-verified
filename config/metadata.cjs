const { author, repository, version } = require("../package.json");

module.exports = {
	name: {
		$: "VoidVerified",
	},
	namespace: "http://tampermonkey.net/",
	version: version,
	author: author,
	source: repository.url,
	// 'license': 'MIT',
	match: ["https://anilist.co/*"],
	require: [
		// `https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js`
	],
	grant: ["GM.xmlHttpRequest"],
};
//
