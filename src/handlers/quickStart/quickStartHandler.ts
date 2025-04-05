import {DOM} from "../../utils/DOM";
import hotkeys from "../../libraries/hotkeys";
import {CloseIcon, CogIcon, CommandLineIcon} from "../../assets/icons";
import {AnilistPaths} from "./anilistPaths";
import {FuzzyMatch} from "../../utils/fuzzyMatch";
import {StaticSettings} from "../../utils/staticSettings";
import {Checkbox, InputField, KeyInput, Label, SettingLabel} from "../../components/components";
import {IOption} from "../../types/settings";
import {QuickAccess} from "../quickAccessHandler";
import {NotificationFeedHandler} from "../notifications/notificationFeedHandler";
import {NotificationWrapper} from "../../components/notificationWrapper";
import {ReadNotifications} from "../../components/readNotifications";
import {NotificationConfig} from "../notifications/notificationConfig";
import {NotificationsCache} from "../notifications/notificationsCache";
import {QuickStartConfig} from "./quickStartConfig";
import {LocalStorageKeys} from "../../assets/localStorageKeys";
import {ActivitySearchMode} from "./modes/activitySearchMode";
import {Debouncer} from "../../utils/debouncer";
import {SelectComponent} from "../../components/selectComponent";
import {Typescript} from "../../utils/typescript";
import {ALScrollock} from "../../utils/ALScrollock";

export enum QuickStartMode {
	Dashboard,
	ActivitySearch
}

export class QuickStartHandler {
	static container: HTMLDivElement;
	private static commandInput: HTMLInputElement;
	private static modeSelect: SelectComponent;
	static headContainer: HTMLDivElement;
	static resultsContainer: HTMLDivElement;
	private static quickAccessUsers: HTMLDivElement;
	private static notificationsContainer: HTMLDivElement;
	private static configContainer: HTMLDivElement;

	static config: QuickStartConfig;
	static mode = QuickStartMode.Dashboard;
	private static debouncer = new Debouncer();

	static initialize() {
		this.config = new QuickStartConfig();
		this.container = DOM.create("div", "quick-start-container");
		this.configContainer = this.createConfigContainer();
		this.configContainer.setAttribute("void-hidden", "true");
		document.body.append(this.container);
		this.container.addEventListener("click", (event) => {
			if (event.currentTarget === event.target) {
				this.closeQuickStart();
			}
		});

		const inputContainer = DOM.create("div", "quick-start-input-container");
		this.commandInput = DOM.create("input");
		this.commandInput.setAttribute("placeholder", "Filter VoidVerified QuickStart");
		this.commandInput.addEventListener("input", (event) => {
			const target = event.target as HTMLInputElement;
			this.debouncer.debounce(this.handleCommand.bind(this),
				this.mode === QuickStartMode.ActivitySearch ? 350 : 100,
				target.value);
		});
		inputContainer.append(CommandLineIcon(), this.commandInput);

		const settingsIcon = CogIcon();
		settingsIcon.addEventListener("click", () => {
			this.configContainer.setAttribute("void-hidden", `${this.configContainer.getAttribute("void-hidden") !== "true"}`)
		})
		const closeIcon = CloseIcon();
		closeIcon.addEventListener("click", () => {
			this.closeQuickStart();
		});
		inputContainer.append(settingsIcon, closeIcon);

		this.container.append(inputContainer);

		const modes = Typescript.getTypeKeys(QuickStartMode);
		this.modeSelect = new SelectComponent(
			QuickStartMode[this.mode],
			modes,
			(value) => {
				// @ts-ignore it works
				this.mode = QuickStartMode[value];
				this.openQuickStart(false);
			});

		const contentContainer = DOM.create("div", "quick-start-content-container");
		contentContainer.addEventListener("click", (event) => {
			if (event.currentTarget === event.target) {
				this.closeQuickStart();
			}
		});
		this.container.append(contentContainer);

		contentContainer.append(DOM.create("div", "quick-start-mode-select-container", this.modeSelect.element));

		contentContainer.append(this.configContainer);

		this.headContainer = DOM.create("div", "quick-start-head-container");
		contentContainer.append(this.headContainer);

		this.resultsContainer = DOM.create("div", "quick-start-results-container");
		this.resultsContainer.addEventListener("click", (event) => {
			if (event.currentTarget === event.target) {
				this.closeQuickStart();
			}
		});
		contentContainer.append(this.resultsContainer);

		hotkeys(this.config.openQuickStartKeybind, "all", this.openQuickStart);
	}

	private static bindOpenQuickStart(newBind: string, oldBind: string) {
		if (oldBind) {
			// @ts-ignore
			hotkeys.unbind(oldBind, "all", this.openQuickStart);
		}
		hotkeys(newBind, "all", this.openQuickStart);
	}

	private static openQuickStart(cycle = true) {
		if (!StaticSettings.options.quickStartEnabled.getValue()) {
			return;
		}
		if (QuickStartHandler.container.classList.contains("void-visible")) {
			QuickStartHandler.commandInput.value = "";
			if (cycle) {
				QuickStartHandler.cycleMode();
			}
		}
		QuickStartHandler.headContainer.replaceChildren();
		QuickStartHandler.resultsContainer.replaceChildren();
		QuickStartHandler.container.classList.add("void-visible");
		ALScrollock.lock();
		QuickStartHandler.commandInput.focus();
		QuickStartHandler.handleModes();
		QuickStartHandler.modeSelect.updateActive(QuickStartMode[QuickStartHandler.mode]);
	}

	private static cycleMode() {
		const modes = Object.values(QuickStartMode).filter(value => typeof value === "number") as QuickStartMode[];
		if (this.mode + 1 >= modes.length) {
			this.mode = QuickStartMode.Dashboard;
		} else {
			this.mode++;
		}
	}

	private static handleModes() {
		switch (this.mode) {
			case QuickStartMode.Dashboard:
				this.handleDefaultMode();
				break;
			case QuickStartMode.ActivitySearch:
				this.handleActivitySearchMode();
		}
	}

	private static handleDefaultMode() {
		this.quickAccessUsers = DOM.create("div");
		this.headContainer.append(this.quickAccessUsers);

		this.notificationsContainer = DOM.create("div", "quick-start-notifications");
		this.headContainer.append(this.notificationsContainer);
		this.handleNotifications();
		this.handleQuickAccessUsers();
		if (this.config.displayAllResultsOnEmpty) {
			this.handleAnilistLinks("");
			this.handleVoidSettings("");
		}
	}

	private static handleActivitySearchMode() {
		ActivitySearchMode.handleMode();
	}

	static isOpen() {
		return this.container.classList.contains("void-visible");
	}

	static closeQuickStart() {
		if (!this.isOpen()) {
			return;
		}
		this.mode = QuickStartMode.Dashboard;
		this.container.classList.remove("void-visible");
		ALScrollock.unlock()
		this.resultsContainer.replaceChildren();
		this.headContainer.replaceChildren();
		this.commandInput.value = "";
	}

	private static handleCommand(command: string) {
		switch (this.mode) {
			case QuickStartMode.ActivitySearch:
				ActivitySearchMode.handleCommand(command);
				return;
			case QuickStartMode.Dashboard:
				break;
		}

		this.resultsContainer.replaceChildren();
		this.handleQuickAccessUsers(command);
		this.handleNotifications(command);
		if (command.length === 0 && !this.config.displayAllResultsOnEmpty) {
			return;
		}

		this.handleAnilistLinks(command);
		this.handleVoidSettings(command);
	}

	private static handleAnilistLinks(command: string) {
		if (!this.config.anilistLinksEnabled) {
			return;
		}
		const paths = AnilistPaths.filter(x => FuzzyMatch.match(command, x.name));
		if (paths.length > 0) {
			const pathResults = paths.map(x => {
				const link = DOM.create("a", "quick-start-result", x.name);
				link.setAttribute("href", x.path);
				link.addEventListener("click", () => {
					this.closeQuickStart();
				})
				return link;
			});
			this.resultsContainer.append(DOM.create("div", "quick-start-results-list", [DOM.create("h3", "quick-start-results-title", "AniList Links"), ...pathResults]));
		}
	}

	private static handleVoidSettings(command: string) {
		if (!this.config.voidSettingsEnabled) {
			return;
		}
		const voidSettings = Object.entries(StaticSettings.options).filter(([_, value]) => FuzzyMatch.match(command, value.description));
		if (voidSettings.length > 0) {
			const options = voidSettings.map(([key, option]: [key: string, option: IOption]) => {
				if (typeof option.getValue() === "boolean") {
					return DOM.create(
						"div",
						"quick-start-result",
						SettingLabel(
							option.description,
							Checkbox(option.getValue(), (event) => {
								StaticSettings.settingsInstance.saveSettingToLocalStorage(key, event.target.checked);
							})));
				}
				const input = InputField(option.getValue(), (event) => {
					StaticSettings.settingsInstance.saveSettingToLocalStorage(key, event.target.value);
				}, "quick-access-option-input");
				return DOM.create("div", "quick-start-result", SettingLabel(option.description, input));
			});
			this.resultsContainer.append(DOM.create("div", "quick-start-results-list", [DOM.create("h3", "quick-start-results-title", "VoidVerified Settings"), ...options]));
		}
	}

	private static handleQuickAccessUsers(command?: string) {
		if (!this.config.usersEnabled) {
			this.quickAccessUsers.setAttribute("void-disabled", "true");
			this.quickAccessUsers.replaceChildren();
			return;
		}
		this.quickAccessUsers.removeAttribute("void-disabled");
		this.quickAccessUsers.replaceChildren(QuickAccess.renderUsers(command));
	}

	private static handleNotifications(command?: string) {
		if (!StaticSettings.options.replaceNotifications.getValue() || !this.config.notificationsEnabled) {
			this.notificationsContainer.setAttribute("void-disabled", "true");
			this.notificationsContainer.replaceChildren();
			return;
		}
		this.notificationsContainer.removeAttribute("void-disabled");
		if (!NotificationFeedHandler.notifications) {
			return;
		}
		const notificationConfig = new NotificationConfig(
			LocalStorageKeys.notificationsConfig,
		);

		let notifications = [...NotificationFeedHandler.notifications];

		if (this.config.onlyIncludeUnreadNotifications) {
			notifications = notifications.filter(x => !ReadNotifications.isRead(x.id));
		}

		notifications = NotificationFeedHandler.filterNotifications(notifications, command);

		if (notifications.length > 0 && notificationConfig.groupNotifications) {
			const activityIds = new Set(
				notifications
					.filter((x) => x.activityId)
					.filter((x) => x.type !== "ACTIVITY_MESSAGE")
					.map((x) => x.activityId),
			);
			const [relations] = NotificationsCache.getCachedRelations(Array.from(activityIds));
			notifications = notifications.map((notification) => {
				notification.activity = relations.find((relation) => notification.activityId === relation.id);
				return notification;
			});
		}

		this.notificationsContainer.replaceChildren(...notifications
			.map(x => NotificationWrapper(x, true)));
	}

	static createConfigContainer() {
		const configContainer = DOM.create("div", "quick-start-config-container");
		configContainer.append(DOM.create("h3", "header", "QuickStart Configuration"));
		const keybindInput = KeyInput(this.config.openQuickStartKeybind, "all", (event) => {
			this.bindOpenQuickStart(event.target.value, this.config.openQuickStartKeybind);
			this.config.openQuickStartKeybind = event.target.value;
			this.config.save();
		});
		hotkeys("*", {element: keybindInput, scope: "all"}, (event) => {
			if (event.target !== keybindInput) {
				return;
			}
			// @ts-ignore
			const keys = hotkeys.getPressedKeyString();
			keybindInput.value = keys.join("+");
		});
		configContainer.append(
			Label("Open QuickStart shortcut", keybindInput)
		)
		configContainer.append(
			SettingLabel("Add QuickStart Button to navigation", Checkbox(this.config.addNavigationButtons, (event) => {
				this.config.addNavigationButtons = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel("Display Quick Access users", Checkbox(this.config.usersEnabled, (event) => {
				this.config.usersEnabled = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel(`Display notifications (requires "${StaticSettings.options.replaceNotifications.description}" enabled)`, Checkbox(this.config.notificationsEnabled, (event) => {
				this.config.notificationsEnabled = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel("Only display unread notifications", Checkbox(this.config.onlyIncludeUnreadNotifications, (event) => {
				this.config.onlyIncludeUnreadNotifications = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel("Display all results when search is empty", Checkbox(this.config.displayAllResultsOnEmpty, (event) => {
				this.config.displayAllResultsOnEmpty = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel("Include AniList links", Checkbox(this.config.anilistLinksEnabled, (event) => {
				this.config.anilistLinksEnabled = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel("Include VoidVerified settings", Checkbox(this.config.voidSettingsEnabled, (event) => {
				this.config.voidSettingsEnabled = event.target.checked;
				this.config.save();
			})));
		configContainer.append(
			SettingLabel("Preserve activity search on close", Checkbox(this.config.preserveActivitySearch, (event) => {
				this.config.preserveActivitySearch = event.target.checked;
				this.config.save();
			})));
		return configContainer;
	}

	static addNavigationButtons() {
		if (!this.config.addNavigationButtons  || !StaticSettings.options.quickStartEnabled.getValue()) {
			return;
		}

		const nav = document.querySelector(".nav > .wrap:not(:has(.void-quick-start-nav-button))");
		if (nav) {
			const button = DOM.create("div", "quick-start-nav-button");
			button.append(CommandLineIcon());
			button.addEventListener("click", () => {
				this.openQuickStart();
			})
			nav.insertBefore(button, nav.querySelector(".search"));
		}

		const mobileNav = document.querySelector(".mobile-nav .menu:not(:has(.void-quick-start-mobile-nav-button))");

		if (mobileNav) {
			const button = DOM.create("div", "quick-start-mobile-nav-button");
			button.append(CommandLineIcon());
			button.append(DOM.create("div", null, "QuickStart"));
			button.addEventListener("click", () => {
				this.openQuickStart();
			});
			mobileNav.append(button);
		}
	}
}
