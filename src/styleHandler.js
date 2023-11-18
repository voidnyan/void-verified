export class StyleHandler {
	Settings;
	usernameStyles = "";
	highlightStyles = "";
	otherStyles = "";

	profileLink = this.createStyleLink("", "profile");

	constructor(settings) {
		this.Settings = settings;
	}

	refreshStyles() {
		this.createStyles();
		this.createStyleLink(this.usernameStyles, "username");
		this.createStyleLink(this.highlightStyles, "highlight");
		this.createStyleLink(this.otherStyles, "other");
	}

	createStyles() {
		this.usernameStyles = "";
		this.otherStyles = `a[href="/settings/developer" i]::after{content: " & Void"}`;

		for (const user of this.Settings.VerifiedUsers) {
			if (
				this.Settings.getOptionValue(
					this.Settings.Options.enabledForUsername
				) ||
				user.enabledForUsername
			) {
				this.createUsernameCSS(user);
			}
		}

		if (
			this.Settings.getOptionValue(
				this.Settings.Options.moveSubscribeButtons
			)
		) {
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

		if (this.Settings.getOptionValue(this.Settings.Options.hideLikeCount)) {
			this.otherStyles += `
                    .like-wrap .count {
                        display: none;
                    }
                `;
		}
	}

	createHighlightStyles() {
		this.highlightStyles = "";
		for (const user of this.Settings.VerifiedUsers) {
			if (
				this.Settings.getOptionValue(
					this.Settings.Options.highlightEnabled
				) ||
				user.highlightEnabled
			) {
				this.createHighlightCSS(
					user,
					`div.wrap:has( div.header > a.name[href*="${user.username}" i] )`
				);
				this.createHighlightCSS(
					user,
					`div.wrap:has( div.details > a.name[href*="${user.username}" i] )`
				);
			}

			if (
				this.Settings.getOptionValue(
					this.Settings.Options.highlightEnabledForReplies
				) ||
				user.highlightEnabledForReplies
			) {
				this.createHighlightCSS(
					user,
					`div.reply:has( a.name[href*="${user.username}" i] )`
				);
			}
		}

		this.disableHighlightOnSmallCards();
	}

	createUsernameCSS(user) {
		this.usernameStyles += `
                a.name[href*="${user.username}" i]::after {
                    content: "${
						this.stringIsEmpty(user.sign) ??
						this.Settings.getOptionValue(
							this.Settings.Options.defaultSign
						)
					}";
                    color: ${
						this.getUserColor(user) ?? "rgb(var(--color-blue))"
					}
                }
                `;
	}

	createHighlightCSS(user, selector) {
		this.highlightStyles += `
                ${selector} {
                    margin-right: -${this.Settings.getOptionValue(
						this.Settings.Options.highlightSize
					)};
                    border-right: ${this.Settings.getOptionValue(
						this.Settings.Options.highlightSize
					)} solid ${
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
		if (
			!this.Settings.getOptionValue(
				this.Settings.Options.highlightEnabled
			)
		) {
			return;
		}
		this.createHighlightStyles();
		this.createStyleLink(this.highlightStyles, "highlight");
	}

	clearProfileVerify() {
		this.profileLink.href =
			"data:text/css;charset=UTF-8," + encodeURIComponent("");
	}

	clearStyles(id) {
		const styles = document.getElementById(`void-verified-${id}-styles`);
		styles?.remove();
	}

	verifyProfile() {
		if (
			!this.Settings.getOptionValue(
				this.Settings.Options.enabledForProfileName
			)
		) {
			return;
		}

		const usernameHeader = document.querySelector("h1.name");
		const username = usernameHeader.innerHTML.trim();

		const user = this.Settings.VerifiedUsers.find(
			(u) => u.username === username
		);
		if (!user) {
			this.clearProfileVerify();
			return;
		}

		const profileStyle = `
                    h1.name::after {
                    content: "${
						this.stringIsEmpty(user.sign) ??
						this.Settings.getOptionValue(
							this.Settings.Options.defaultSign
						)
					}"
                    }
                `;
		this.profileLink.href =
			"data:text/css;charset=UTF-8," + encodeURIComponent(profileStyle);
	}

	copyUserColor() {
		const usernameHeader = document.querySelector("h1.name");
		const username = usernameHeader.innerHTML.trim();
		const user = this.Settings.VerifiedUsers.find(
			(u) => u.username === username
		);

		if (!user) {
			return;
		}

		if (
			!(
				user.copyColorFromProfile ||
				this.Settings.getOptionValue(
					this.Settings.Options.copyColorFromProfile
				)
			)
		) {
			return;
		}

		const color =
			getComputedStyle(usernameHeader).getPropertyValue("--color-blue");

		this.Settings.updateUserOption(user.username, "color", color);
	}

	getUserColor(user) {
		return (
			user.colorOverride ??
			(user.color &&
			(user.copyColorFromProfile ||
				this.Settings.getOptionValue(
					this.Settings.Options.copyColorFromProfile
				))
				? `rgb(${user.color})`
				: undefined)
		);
	}

	getDefaultHighlightColor() {
		if (
			this.Settings.getOptionValue(
				this.Settings.Options.useDefaultHighlightColor
			)
		) {
			return this.Settings.getOptionValue(
				this.Settings.Options.defaultHighlightColor
			);
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
