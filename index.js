// ==UserScript==
// @name         VoidVerified-Prerelease
// @namespace    http://tampermonkey.net/
// @version      1.0.0-Prerelease
// @description  Display a verified sign next to user's name in AniList.
// @author       voidnyan
// @match        https://anilist.co/*
// @grant        none
// @license MIT
// ==/UserScript==

(function () {
	"use strict";
	const version = "1.0.0-Prerelease";
	const evaluationIntervalInSeconds = 1;
	const localStorageSettings = "void-verified-settings";
	const localStorageUsers = "void-verified-users";
	const anilistBlue = "120, 180, 255";

	let voidVerifiedSettings = {
		copyColorFromProfile: {
			defaultValue: true,
			description: "Copy user color from their profile when visited.",
		},
		moveSubscribeButtons: {
			defaultValue: false,
			description:
				"Move activity subscribe button next to comments and likes.",
		},
		hideLikeCount: {
			defaultValue: false,
			description: "Hide activity and reply like counts.",
		},
		enabledForUsername: {
			defaultValue: true,
			description: "Display a verified sign next to usernames.",
		},
		enabledForProfileName: {
			defaultValue: false,
			description: "Display a verified sign next to a profile name.",
		},
		defaultSign: {
			defaultValue: "✔",
			description: "The default sign displayed next to a username.",
		},
		highlightEnabled: {
			defaultValue: true,
			description: "Highlight user activity with a border.",
		},
		highlightEnabledForReplies: {
			defaultValue: true,
			description: "Highlight replies with a border.",
		},
		highlightSize: {
			defaultValue: "5px",
			description: "Width of the highlight border.",
		},
		useDefaultHighlightColor: {
			defaultValue: false,
			description:
				"Use fallback highlight color when user color is not specified.",
		},
		defaultHighlightColor: {
			defaultValue: "#FFFFFF",
			description: "Fallback highlight color.",
		},
	};

	const settingsInLocalStorage =
		JSON.parse(localStorage.getItem(localStorageSettings)) ?? {};

	for (const [key, value] of Object.entries(settingsInLocalStorage)) {
		if (!voidVerifiedSettings[key]) {
			continue;
		}
		voidVerifiedSettings[key].value = value.value;
	}

	let verifiedUsers =
		JSON.parse(localStorage.getItem(localStorageUsers)) ?? [];

	let usernameStyles = "";
	let highlightStyles = "";
	let otherStyles = "";

	refreshStyles();

	function refreshStyles() {
		createStyles();
		createStyleLink(usernameStyles, "username");
		createStyleLink(highlightStyles, "highlight");
		createStyleLink(otherStyles, "other");
	}

	function createStyles() {
		usernameStyles = "";
		highlightStyles = "";
		otherStyles = "";

		for (const user of verifiedUsers) {
			if (
				getOptionValue(voidVerifiedSettings.enabledForUsername) ||
				user.enabledForUsername
			) {
				createUsernameCSS(user);
			}

			if (
				getOptionValue(voidVerifiedSettings.highlightEnabled) ||
				user.highlightEnabled
			) {
				createHighlightCSS(
					user,
					`div.wrap:has( div.header > a.name[href*="${user.username}"] )`
				);
				createHighlightCSS(
					user,
					`div.wrap:has( div.details > a.name[href*="${user.username}"] )`
				);
			}

			if (
				getOptionValue(
					voidVerifiedSettings.highlightEnabledForReplies
				) ||
				user.highlightEnabledForReplies
			) {
				createHighlightCSS(
					user,
					`div.reply:has( a.name[href*="${user.username}"] )`
				);
			}
		}

		disableHighlightOnSmallCards();

		if (getOptionValue(voidVerifiedSettings.moveSubscribeButtons)) {
			otherStyles += `
            .has-label::before {
            top: -30px !important;
            left: unset !important;
            right: -10px;
            }

            .has-label[label="Unsubscribe"],
            .has-label[label="Subscribe"] {
            font-size: 0.875em !important;
            }

            .has-label[label="Unsubscribe"] {
            color: rgba(var(--color-green),.8);
            }
            `;
		}

		if (getOptionValue(voidVerifiedSettings.hideLikeCount)) {
			otherStyles += `
                .like-wrap .count {
                    display: none;
                }
            `;
		}
	}

	function createUsernameCSS(user) {
		usernameStyles += `
            a.name[href*="${user.username}"]::after {
                content: "${
					stringIsEmpty(user.sign) ??
					getOptionValue(voidVerifiedSettings.defaultSign)
				}";
                color: ${getUserColor(user) ?? "rgb(var(--color-blue))"}
            }
            `;
	}

	function createHighlightCSS(user, selector) {
		highlightStyles += `
            ${selector} {
                margin-right: -${getOptionValue(
					voidVerifiedSettings.highlightSize
				)};
                border-right: ${getOptionValue(
					voidVerifiedSettings.highlightSize
				)} solid ${getUserColor(user) ?? getDefaultHighlightColor()};
                border-radius: 5px;
            }
            `;
	}

	function moveAndDisplaySubscribeButton() {
		if (!getOptionValue(voidVerifiedSettings.moveSubscribeButtons)) {
			return;
		}

		const subscribeButtons = document.querySelectorAll(
			"span[label='Unsubscribe'], span[label='Subscribe']"
		);
		for (const subscribeButton of subscribeButtons) {
			if (subscribeButton.parentNode.classList.contains("actions")) {
				continue;
			}

			const container = subscribeButton.parentNode.parentNode;
			const actions = container.querySelector(".actions");
			actions.append(subscribeButton);
		}
	}

	function disableHighlightOnSmallCards() {
		highlightStyles += `
            div.wrap:has(div.small) {
            margin-right: 0px !important;
            border-right: 0px solid black !important;
            }
            `;
	}

	const profileLink = createStyleLink("", "profile");

	function refreshHomePage() {
		if (!getOptionValue(voidVerifiedSettings.highlightEnabled)) {
			return;
		}

		createStyleLink(highlightStyles, "highlight");
	}

	function verifyProfile() {
		if (!getOptionValue(voidVerifiedSettings.enabledForProfileName)) {
			return;
		}

		const usernameHeader = document.querySelector("h1.name");
		const username = usernameHeader.innerHTML.trim();

		const user = verifiedUsers.find((u) => u.username === username);
		if (!user) {
			profileLink.href =
				"data:text/css;charset=UTF-8," + encodeURIComponent("");
			return;
		}

		const profileStyle = `
                h1.name::after {
                content: "${
					stringIsEmpty(user.sign) ??
					getOptionValue(voidVerifiedSettings.defaultSign)
				}"
                }
            `;
		profileLink.href =
			"data:text/css;charset=UTF-8," + encodeURIComponent(profileStyle);
	}

	function copyUserColor() {
		const usernameHeader = document.querySelector("h1.name");
		const username = usernameHeader.innerHTML.trim();
		const user = verifiedUsers.find((u) => u.username === username);

		if (!user) {
			return;
		}

		if (
			!(
				user.copyColorFromProfile ||
				getOptionValue(voidVerifiedSettings.copyColorFromProfile)
			)
		) {
			return;
		}

		const color =
			getComputedStyle(usernameHeader).getPropertyValue("--color-blue");

		updateUserOption(user.username, "color", color);
	}

	function getOptionValue(object) {
		if (object.value === "") {
			return object.defaultValue;
		}
		return object.value ?? object.defaultValue;
	}

	function renderSettingsUi() {
		const container = document.querySelector(
			".settings.container > .content"
		);
		const settingsContainer = document.createElement("div");
		settingsContainer.setAttribute("id", "voidverified-settings");
		renderSettingsHeader(settingsContainer);

		for (const [key, setting] of Object.entries(voidVerifiedSettings)) {
			renderSetting(setting, settingsContainer, key);
		}

		renderUserTable(settingsContainer);

		container.append(settingsContainer);
	}

	function removeSettingsUi() {
		const settings = document.querySelector("#voidverified-settings");
		settings?.remove();
	}

	function renderSettingsHeader(settingsContainer) {
		const header = document.createElement("h1");
		header.innerText = "VoidVerified Settings";
		settingsContainer.append(header);
	}

	function renderUserTable(settingsContainer) {
		const oldTableContainer = document.querySelector(
			"#void-verified-user-table"
		);
		const tableContainer = document.createElement("div");
		tableContainer.setAttribute("id", "void-verified-user-table");

		const table = document.createElement("table");
		const head = document.createElement("thead");
		const headrow = document.createElement("tr");
		headrow.append(createCell("Username", "th"));
		headrow.append(createCell("Sign", "th"));
		headrow.append(createCell("Color", "th"));

		head.append(headrow);

		const body = document.createElement("tbody");

		for (const user of verifiedUsers) {
			body.append(createUserRow(user));
		}

		table.append(head);
		table.append(body);
		tableContainer.append(table);

		const inputForm = document.createElement("form");
		inputForm.addEventListener("submit", handleVerifyUserForm);
		const label = document.createElement("label");
		label.innerText = "Add user";
		inputForm.append(label);
		const textInput = document.createElement("input");
		textInput.setAttribute("id", "voidverified-add-user");

		inputForm.append(textInput);
		tableContainer.append(inputForm);

		settingsContainer.append(tableContainer);
		oldTableContainer?.remove();
	}

	function createUserRow(user) {
		const row = document.createElement("tr");
		const userLink = document.createElement("a");
		userLink.innerText = user.username;
		userLink.setAttribute(
			"href",
			`https://anilist.co/user/${user.username}/`
		);
		userLink.setAttribute("target", "_blank");
		row.append(userLink);

		const signInput = document.createElement("input");
		signInput.value = user.sign ?? "";
		signInput.addEventListener("input", (event) =>
			updateUserOption(user.username, "sign", event.target.value)
		);
		const signCell = createCell(signInput);
		signCell.append(
			createUserCheckbox(
				user.enabledForUsername,
				user.username,
				"enabledForUsername",
				getOptionValue(voidVerifiedSettings.enabledForUsername)
			)
		);

		row.append(createCell(signCell));

		const colorInput = document.createElement("input");
		colorInput.setAttribute("type", "color");
		colorInput.value = getUserColorPickerColor(user);
		colorInput.addEventListener(
			"change",
			(event) => handleUserColorChange(event, user.username),
			false
		);

		const colorCell = createCell(colorInput);

		colorCell.append(
			createUserCheckbox(
				user.copyColorFromProfile,
				user.username,
				"copyColorFromProfile",
				getOptionValue(voidVerifiedSettings.copyColorFromProfile)
			)
		);

		colorCell.append(
			createUserCheckbox(
				user.highlightEnabled,
				user.username,
				"highlightEnabled",
				getOptionValue(voidVerifiedSettings.highlightEnabled)
			)
		);

		colorCell.append(
			createUserCheckbox(
				user.highlightEnabledForReplies,
				user.username,
				"highlightEnabledForReplies",
				getOptionValue(voidVerifiedSettings.highlightEnabledForReplies)
			)
		);

		const resetColorBtn = document.createElement("button");
		resetColorBtn.innerText = "🔄";
		resetColorBtn.addEventListener("click", () =>
			handleUserColorReset(user.username)
		);

		colorCell.append(resetColorBtn);
		row.append(colorCell);

		const deleteButton = document.createElement("button");
		deleteButton.innerText = "x";
		deleteButton.addEventListener("click", () => removeUser(user.username));
		row.append(createCell(deleteButton));
		return row;
	}

	function getUserColorPickerColor(user) {
		if (user.colorOverride) {
			return user.colorOverride;
		}

		if (
			user.color &&
			(user.copyColorFromProfile ||
				getOptionValue(voidVerifiedSettings.copyColorFromProfile))
		) {
			return rgbToHex(user.color);
		}

		if (getOptionValue(voidVerifiedSettings.useDefaultHighlightColor)) {
			return getOptionValue(voidVerifiedSettings.defaultHighlightColor);
		}

		return rgbToHex(anilistBlue);
	}

	function createUserCheckbox(isChecked, username, settingKey, disabled) {
		const checkbox = document.createElement("input");
		if (disabled) {
			checkbox.setAttribute("disabled", "");
		}

		checkbox.setAttribute("type", "checkbox");
		checkbox.checked = isChecked;
		checkbox.addEventListener("change", (event) =>
			updateUserOption(username, settingKey, event.target.checked)
		);

		checkbox.title = voidVerifiedSettings[settingKey].description;
		return checkbox;
	}

	function handleUserColorReset(username) {
		updateUserOption(username, "colorOverride", undefined);
		refreshUserTable();
	}

	function handleUserColorChange(event, username) {
		const color = event.target.value;
		updateUserOption(username, "colorOverride", color);
	}

	function handleVerifyUserForm(event) {
		event.preventDefault();

		const usernameInput = document.getElementById("voidverified-add-user");
		const username = usernameInput.value;
		verifyUser(username);
		usernameInput.value = "";
		refreshUserTable();
	}

	function refreshUserTable() {
		const container = document.querySelector(
			".settings.container > .content"
		);
		renderUserTable(container);
	}

	function verifyUser(username) {
		if (verifiedUsers.find((user) => user.username === username)) {
			return;
		}

		verifiedUsers.push({ username });
		localStorage.setItem(localStorageUsers, JSON.stringify(verifiedUsers));
		refreshStyles();
	}

	function updateUserOption(username, key, value) {
		verifiedUsers = verifiedUsers.map((u) =>
			u.username === username
				? {
						...u,
						[key]: value,
				  }
				: u
		);
		localStorage.setItem(localStorageUsers, JSON.stringify(verifiedUsers));
		refreshStyles();
		refreshUserTable();
	}

	function removeUser(username) {
		verifiedUsers = verifiedUsers.filter(
			(user) => user.username !== username
		);
		localStorage.setItem(localStorageUsers, JSON.stringify(verifiedUsers));
		refreshUserTable();
		refreshStyles();
	}

	function createCell(content, elementType = "td") {
		const cell = document.createElement(elementType);
		cell.append(content);
		return cell;
	}

	function renderSetting(
		setting,
		settingsContainer,
		settingKey,
		disabled = false
	) {
		const value = getOptionValue(setting);
		const type = typeof value;

		const container = document.createElement("div");
		const input = document.createElement("input");

		if (type === "boolean") {
			input.setAttribute("type", "checkbox");
		} else if (settingKey == "defaultHighlightColor") {
			input.setAttribute("type", "color");
		} else if (type === "string") {
			input.setAttribute("type", "text");
		}

		if (disabled) {
			input.setAttribute("disabled", "");
		}

		input.setAttribute("id", settingKey);
		input.addEventListener("change", (event) =>
			handleOption(event, settingKey, type)
		);

		if (type === "boolean" && value) {
			input.setAttribute("checked", true);
		} else if (type === "string") {
			input.value = value;
		}

		container.append(input);

		const label = document.createElement("label");
		label.setAttribute("for", settingKey);
		label.innerText = setting.description;
		container.append(label);
		settingsContainer.append(container);
	}

	function handleOption(event, settingKey, type) {
		const value =
			type === "boolean" ? event.target.checked : event.target.value;
		saveSettingToLocalStorage(settingKey, value);
		refreshStyles();
		refreshUserTable();
	}

	function getUserColor(user) {
		return (
			user.colorOverride ??
			(user.color &&
			(user.copyColorFromProfile ||
				getOptionValue(voidVerifiedSettings.copyColorFromProfile))
				? `rgb(${user.color})`
				: undefined)
		);
	}

	function getDefaultHighlightColor() {
		if (getOptionValue(voidVerifiedSettings.useDefaultHighlightColor)) {
			return getOptionValue(voidVerifiedSettings.defaultHighlightColor);
		}
		return "rgb(var(--color-blue))";
	}

	function rgbToHex(rgb) {
		const [r, g, b] = rgb.split(",");
		const hex = generateHex(r, g, b);
		return hex;
	}

	function generateHex(r, g, b) {
		return (
			"#" +
			[r, g, b]
				.map((x) => {
					const hex = Number(x).toString(16);
					return hex.length === 1 ? "0" + hex : hex;
				})
				.join("")
		);
	}

	function saveSettingToLocalStorage(key, value) {
		let localSettings = JSON.parse(
			localStorage.getItem(localStorageSettings)
		);

		voidVerifiedSettings[key].value = value;

		if (localSettings === null) {
			const settings = {
				[key]: value,
			};
			localStorage.setItem(
				localStorageSettings,
				JSON.stringify(settings)
			);
			return;
		}

		localSettings[key] = { value };
		localStorage.setItem(
			localStorageSettings,
			JSON.stringify(localSettings)
		);
	}

	function createStyleLink(styles, id) {
		const oldLink = document.getElementById(`void-verified-${id}-styles`);
		const link = document.createElement("link");
		link.setAttribute("id", `void-verified-${id}-styles`);
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute(
			"href",
			"data:text/css;charset=UTF-8," + encodeURIComponent(styles)
		);
		document.head?.append(link);
		oldLink?.remove();
		return link;
	}

	let currentPath = "";
	function hasPathChanged(path) {
		if (path === currentPath) {
			return false;
		}
		currentPath = path;
		return true;
	}

	function stringIsEmpty(string) {
		if (!string || string.length === 0) {
			return undefined;
		}
		return string;
	}

	function handleIntervalScripts() {
		const path = window.location.pathname;

		moveAndDisplaySubscribeButton();

		if (path === "/home") {
			refreshHomePage();
			return;
		}

		if (!path.startsWith("/settings/developer")) {
			removeSettingsUi();
		}

		if (!hasPathChanged(path)) {
			return;
		}

		if (path.startsWith("/user/")) {
			verifyProfile();
			copyUserColor();
			return;
		}

		if (path.startsWith("/settings/developer")) {
			renderSettingsUi();
			return;
		}
	}

	setInterval(handleIntervalScripts, evaluationIntervalInSeconds * 1000);

	console.log(`VoidVerified ${version} loaded.`);
})();
