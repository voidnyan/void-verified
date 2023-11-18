import { build } from "@kellnerd/userscript-bundler";

build({
	userscriptSourcePath: "src/",
	// docSourcePath: "doc/",
	outputPath: "dist/",
	readmePath: "doc/discard.md",
});
