const GM_info = (function () {
	const script = { version: "TEST" };
	return { script };
})();

Object.defineProperty(window, "GM_info", {
	value: GM_info,
});
