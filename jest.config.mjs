/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: "coverage",
	moduleFileExtensions: ["js"],

	roots: ["./src", "./tests"],
	setupFiles: ["./tests/GM_infoMock.js", "./tests/broadcastChannerMock.js"],
	transform: {
		"\\.[jt]sx?$": "babel-jest",
	},
	testEnvironment: "jsdom",
};

export default config;
