import fs from "fs";

const userscript = "dist/voidverified.user.js";
const header = "build/scriptHeader.js";
const version = process.argv.find((arg) => arg.startsWith("v")).slice(1);

if (!version) {
	throw new Error("Version number is required when building for production.");
}

const versionLine = `// @version       ${version}`;

let content = fs.readFileSync(userscript).toString().split("\n");
let result = fs.readFileSync(header).toString().split("\n");

result[2] = versionLine;

content = content.slice(14);

result = result.concat(content);
// result = result.join("\n");
fs.writeFileSync("dist/voidverified.user.js", result.join("\n"));
