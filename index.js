// ==UserScript==
// @name         VoidVerified
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Display a verified sign next to user's name in AniList.
// @author       voidnyan
// @match        https://anilist.co/*
// @grant        none
// @license MIT
// ==/UserScript==

(function () {
	"use strict";
	const version = "1.0.0";
	const evaluationIntervalInSeconds = 1;
	const localStorageColors = "void-verified-colors";
	const localStorageSettings = "void-verified-settings";
	const localStorageUsers = "void-verified-users";

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
			description: "this should not render",
		},

		highlightEnabled: {
			defaultValue: true,
			description: "Highlight user activity with a border color.",
		},
		highlightEnabledForReplies: {
			defaultValue: true,
			description: "Highligh replies with a border color.",
		},
		highlightSize: {
			defaultValue: "5px",
			description: "Width of the highlight border.",
		},
	};

	const settingsInLocalStorage = JSON.parse(
		localStorage.getItem(localStorageSettings)
	);

	for (const [key, value] of Object.entries(settingsInLocalStorage)) {
		voidVerifiedSettings[key].value = value.value;
	}

	const shouldIntervalBeUsed =
		getOptionValue(voidVerifiedSettings.enabledForProfileName) ||
		getOptionValue(voidVerifiedSettings.highlightEnabled);

	let verifiedUsers = [
		{
			username: "voidnyan",
			sign: "💻",
		},
	].map((u) => (typeof u === "string" ? { username: u } : u));

	const colorsInLocalStorage = JSON.parse(
		localStorage.getItem(localStorageColors)
	);

	if (colorsInLocalStorage !== null) {
		verifiedUsers = verifiedUsers.map((u) =>
			colorsInLocalStorage !== null && u.color
				? u
				: {
						...u,
						color: colorsInLocalStorage.find(
							(c) => c.username === u.username
						)?.color,
				  }
		);
	}

	let usernameStyles = "";
	let highlightStyles = "";
	let otherStyles = "";

	createStyles();

	function createStyles() {
		usernameStyles = "";
		highlightStyles = "";
		for (const user of verifiedUsers) {
			if (getOptionValue(voidVerifiedSettings.enabledForUsername)) {
				createUsernameCSS(user);
			}

			if (getOptionValue(voidVerifiedSettings.highlightEnabled)) {
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
				getOptionValue(voidVerifiedSettings.highlightEnabledForReplies)
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
					user.sign ??
					getOptionValue(voidVerifiedSettings.defaultSign)
				}";
                color: ${user.color ?? "rgb(var(--color-blue))"}
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
				)} solid ${user.color ?? "rgb(var(--color-blue))"};
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

	const usernameLink = createStyleLink(usernameStyles, "username");
	const highlightLink = createStyleLink(highlightStyles, "highlight");
	const profileLink = createStyleLink("", "profile");
	const otherLink = createStyleLink(otherStyles, "other");

	function refreshHomePage() {
		if (!getOptionValue(voidVerifiedSettings.highlightEnabled)) {
			return;
		}

		const oldHighlightLink = document.getElementById(
			"void-verified-highlight-styles"
		);
		createStyleLink(highlightStyles, "highlight");
		oldHighlightLink.remove();
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
					user.sign ??
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

		if (
			user.copyColorFromProfile === false ||
			(!user.copyColorFromProfile &&
				!getOptionValue(voidVerifiedSettings.copyColorFromProfile))
		) {
			return;
		}

		const color =
			getComputedStyle(usernameHeader).getPropertyValue("--color-blue");
		user.color = `rgb(${color})`;
		verifiedUsers = verifiedUsers.map((u) =>
			u.username !== user.username ? u : user
		);

		createStyles();

		const oldHighlightLink = document.getElementById(
			"void-verified-highlight-styles"
		);
		createStyleLink(highlightStyles, "highlight");
		oldHighlightLink.remove();

		const oldUsernameLink = document.getElementById(
			"void-verified-username-styles"
		);
		createStyleLink(usernameStyles, "username");
		oldUsernameLink.remove();

		addOrUpdateColorToLocalStorage(user);
	}

	function addOrUpdateColorToLocalStorage(user) {
		let localColors = JSON.parse(localStorage.getItem(localStorageColors));

		if (localColors === null) {
			localStorage.setItem(
				localStorageColors,
				JSON.stringify([{ username: user.username, color: user.color }])
			);
			return;
		}

		let localStorageUser = localColors.find(
			(u) => u.username === user.username
		);
		if (localStorageUser) {
			localStorageUser.color = user.color;
			localColors = localColors.map((u) =>
				u.username === localStorageUser.username ? localStorageUser : u
			);
		} else {
			localColors.push({ username: user.username, color: user.color });
		}

		localStorage.setItem(localStorageColors, JSON.stringify(localColors));
	}

	function getOptionValue(object) {
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
			renderBoolSetting(setting, settingsContainer, key);
		}

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

	function renderBoolSetting(setting, settingsContainer, settingKey) {
		const value = getOptionValue(setting);
		if (typeof value !== "boolean") {
			return;
		}

		const container = document.createElement("div");
		const checkbox = document.createElement("input");
		checkbox.setAttribute("type", "checkbox");
		checkbox.addEventListener("change", (event) =>
			handleCheckbox(event, settingKey)
		);

		if (value) {
			checkbox.setAttribute("checked", true);
		}

		container.appendChild(checkbox);

		const label = document.createElement("label");
		label.innerText = setting.description;
		container.appendChild(label);
		settingsContainer.append(container);
	}

	function handleCheckbox(event, settingKey) {
		const value = event.target.checked;
		saveSettingToLocalStorage(settingKey, value);
	}

	function saveSettingToLocalStorage(key, value) {
		let localSettings = JSON.parse(
			localStorage.getItem(localStorageSettings)
		);

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
		const link = document.createElement("link");
		link.setAttribute("id", `void-verified-${id}-styles`);
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute(
			"href",
			"data:text/css;charset=UTF-8," + encodeURIComponent(styles)
		);
		document.head?.append(link);
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

	if (shouldIntervalBeUsed) {
		setInterval(handleIntervalScripts, evaluationIntervalInSeconds * 1000);
	}

	console.log(`VoidVerified ${version} loaded.`);
})();
