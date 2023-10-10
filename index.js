// ==UserScript==
// @name         VoidVerified
// @namespace    http://tampermonkey.net/
// @version      0.4.1
// @description  Display a verified sign next to user's name in AniList.
// @author       voidnyan
// @match        https://anilist.co/*
// @grant        none
// @license MIT
// ==/UserScript==

(function () {
	"use strict";
	const version = "0.4.1";
	const evaluationIntervalInSeconds = 1;
	const localStorageColors = "void-verified-colors";

	const verified = {
		copyColorFromProfile: true,
		moveSubscribeButtons: true,
		autoLikeOnSubscribe: true,
		username: {
			enabled: true,
			enabledForReplies: true,
			enabledForProfileName: true,
			color: "white",
			sign: "✔",
		},
		highlight: {
			enabled: true,
			enabledForReplies: true,
			enabledForSmallCards: false,
			color: undefined,
			size: "5px",
		},
	};

	const shouldIntervalBeUsed =
		verified.username.enabledForProfileName || verified.highlight.enabled;

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
			if (verified.username.enabled) {
				createUsernameCSS(user);
			}

			if (verified.highlight.enabled) {
				createHighlightCSS(
					user,
					`div.wrap:has( div.header > a.name[href*="${user.username}"] )`
				);
				createHighlightCSS(
					user,
					`div.wrap:has( div.details > a.name[href*="${user.username}"] )`
				);
			}

			if (verified.highlight.enabledForReplies) {
				createHighlightCSS(
					user,
					`div.reply:has( a.name[href*="${user.username}"] )`
				);
			}
		}

		if (
			verified.highlight.enabled &&
			!verified.highlight.enabledForSmallCards
		) {
			disableHighlightOnSmallCards();
		}

		if (verified.moveSubscribeButtons) {
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
	}

	function createUsernameCSS(user) {
		usernameStyles += `
            a.name[href*="${user.username}"]::after {
                content: "${user.sign ?? verified.username.sign}";
                color: ${
					user.color ??
					verified.username.color ??
					"rgb(var(--color-blue))"
				}
            }
            `;
	}

	function createHighlightCSS(user, selector) {
		highlightStyles += `
            ${selector} {
                margin-right: -${verified.highlight.size};
                border-right: ${verified.highlight.size} solid ${
			user.color ?? verified.highlight.color ?? "rgb(var(--color-blue))"
		};
                border-radius: 5px;
            }
            `;
	}

	function moveAndDisplaySubscribeButton() {
		if (!verified.moveSubscribeButtons) {
			return;
		}

		const subscribeButtons = document.querySelectorAll(
			"span[label='Unsubscribe'], span[label='Subscribe']"
		);
		for (const subscribeButton of subscribeButtons) {
			if (subscribeButton.parentNode.classList.contains("actions")) {
				continue;
			}

			if (verified.autoLikeOnSubscribe) {
				subscribeButton.addEventListener("click", likeActivity);
			}

			const container = subscribeButton.parentNode.parentNode;
			const actions = container.querySelector(".actions");
			actions.append(subscribeButton);
		}
	}

	function likeActivity() {
		// const container = this.parentNode;
		// const likeButton = container.querySelector(".like-wrap .button");
		// if (likeButton.classList.contains("liked")) {
		//     return;
		//
		// // likeButton.click();
		// likeButton.dispatchEvent(new Event("click"));
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
		if (!verified.highlight.enabled) {
			return;
		}

		const oldHighlightLink = document.getElementById(
			"void-verified-highlight-styles"
		);
		const newHighlightLink = createStyleLink(highlightStyles, "highlight");
		oldHighlightLink.remove();
	}

	function verifyProfile() {
		if (!verified.username.enabledForProfileName) {
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
                content: "${user.sign ?? verified.username.sign}"
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
			(!user.copyColorFromProfile && !verified.copyColorFromProfile)
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
		const newHighlightLink = createStyleLink(highlightStyles, "highlight");
		oldHighlightLink.remove();

		const oldUsernameLink = document.getElementById(
			"void-verified-username-styles"
		);
		const newUsernameLink = createStyleLink(usernameStyles, "username");
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

		if (!hasPathChanged(path)) {
			return;
		}

		if (path.startsWith("/user/")) {
			verifyProfile();
			copyUserColor();
		}
	}

	if (shouldIntervalBeUsed) {
		setInterval(handleIntervalScripts, evaluationIntervalInSeconds * 1000);
	}

	console.log(`VoidVerified ${version} loaded.`);
})();
