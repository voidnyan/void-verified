export class StyleHandler {
	settings;
	usernameStyles = "";
	highlightStyles = "";
	otherStyles = "";

	constructor(settings) {
		this.settings = settings;
	}

	refreshStyles() {
		this.createStyles();
		this.createStyleLink(this.usernameStyles, "username");
		this.createStyleLink(this.highlightStyles, "highlight");
		this.createStyleLink(this.otherStyles, "other");
	}

	createStyles() {
		this.usernameStyles = "";
		this.otherStyles = "";

		for (const user of this.settings.verifiedUsers) {
			if (
				this.settings.options.enabledForUsername.getValue() ||
				user.enabledForUsername
			) {
				this.createUsernameCSS(user);
			}
		}

		if (this.settings.options.moveSubscribeButtons.getValue()) {
			this.otherStyles += `
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

		this.createHighlightStyles();

		if (this.settings.options.hideLikeCount.getValue()) {
			this.otherStyles += `
                    .like-wrap .count {
                        display: none;
                    }
                `;
		}
	}

	createHighlightStyles() {
		this.highlightStyles = "";
		for (const user of this.settings.verifiedUsers) {
			if (
				this.settings.options.highlightEnabled.getValue() ||
				user.highlightEnabled
			) {
				this.createHighlightCSS(
					user,
					`div.wrap:has( div.header > a.name[href*="/${user.username}/" i] )`
				);
				this.createHighlightCSS(
					user,
					`div.wrap:has( div.details > a.name[href*="/${user.username}/" i] )`
				);
			}

			if (
				this.settings.options.highlightEnabledForReplies.getValue() ||
				user.highlightEnabledForReplies
			) {
				this.createHighlightCSS(
					user,
					`div.reply:has( a.name[href*="/${user.username}/" i] )`
				);
			}

			this.#createActivityCss(user);
		}

		this.disableHighlightOnSmallCards();
	}

	#createActivityCss(user) {
		const colorUserActivity =
			this.settings.options.colorUserActivity.getValue() ??
			user.colorUserActivity;
		const colorUserReplies =
			this.settings.options.colorUserReplies.getValue() ??
			user.colorUserReplies;

		if (colorUserActivity) {
			this.highlightStyles += `
                div.wrap:has( div.header > a.name[href*="/${
					user.username
				}/"]) a,
                div.wrap:has( div.details > a.name[href*="/${
					user.username
				}/"]) a
                {
                    color: ${this.getUserColor(user)};
                }
            `;
		}
		if (colorUserReplies) {
			this.highlightStyles += `
                .reply:has(a.name[href*="/${user.username}/"]) a,
                .reply:has(a.name[href*="/${
					user.username
				}/"]) .markdown-spoiler::before
                {
                    color: ${this.getUserColor(user)};
                }
            `;
		}
	}

	createUsernameCSS(user) {
		this.usernameStyles += `
            a.name[href*="/${user.username}/" i]::after {
                content: "${
					this.stringIsEmpty(user.sign) ??
					this.settings.options.defaultSign.getValue()
				}";
                color: ${this.getUserColor(user) ?? "rgb(var(--color-blue))"}
            }
        `;
	}

	createHighlightCSS(user, selector) {
		this.highlightStyles += `
                ${selector} {
                    margin-right: -${this.settings.options.highlightSize.getValue()};
                    border-right: ${this.settings.options.highlightSize.getValue()} solid ${
			this.getUserColor(user) ?? this.getDefaultHighlightColor()
		};
                    border-radius: 5px;
                }
                `;
	}

	disableHighlightOnSmallCards() {
		this.highlightStyles += `
                div.wrap:has(div.small) {
                margin-right: 0px !important;
                border-right: 0px solid black !important;
                }
                `;
	}

	refreshHomePage() {
		if (!this.settings.options.highlightEnabled.getValue()) {
			return;
		}
		this.createHighlightStyles();
		this.createStyleLink(this.highlightStyles, "highlight");
	}

	clearStyles(id) {
		const styles = document.getElementById(`void-verified-${id}-styles`);
		styles?.remove();
	}

	verifyProfile() {
		if (!this.settings.options.enabledForProfileName.getValue()) {
			return;
		}

		const usernameHeader = document.querySelector("h1.name");
		const username = usernameHeader.innerHTML.trim();

		const user = this.settings.verifiedUsers.find(
			(u) => u.username.toLowerCase() === username.toLowerCase()
		);

		if (!user) {
			this.clearStyles("profile");
			return;
		}

		const profileStyle = `
                    .name-wrapper h1.name::after {
                    content: "${
						this.stringIsEmpty(user.sign) ??
						this.settings.options.defaultSign.getValue()
					}"
                    }
                `;
		this.createStyleLink(profileStyle, "profile");
	}

	getStyleLink(id) {
		return document.getElementById(`void-verified-${id}-styles`);
	}

	copyUserColor() {
		const usernameHeader = document.querySelector("h1.name");
		const username = usernameHeader.innerHTML.trim();
		const user = this.settings.verifiedUsers.find(
			(u) => u.username === username
		);

		if (!user) {
			return;
		}

		if (
			!(
				user.copyColorFromProfile ||
				this.settings.options.copyColorFromProfile.getValue()
			)
		) {
			return;
		}

		const color =
			getComputedStyle(usernameHeader).getPropertyValue("--color-blue");

		this.settings.updateUserOption(user.username, "color", color);
	}

	getUserColor(user) {
		return (
			user.colorOverride ??
			(user.color &&
			(user.copyColorFromProfile ||
				this.settings.options.copyColorFromProfile.getValue())
				? `rgb(${user.color})`
				: undefined)
		);
	}

	getDefaultHighlightColor() {
		if (this.settings.options.useDefaultHighlightColor.getValue()) {
			return this.settings.options.defaultHighlightColor.getValue();
		}
		return "rgb(var(--color-blue))";
	}

	createStyleLink(styles, id) {
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

	stringIsEmpty(string) {
		if (!string || string.length === 0) {
			return undefined;
		}
		return string;
	}
}
