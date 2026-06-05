import {DOM} from "../../../utils/DOM";
import {StaticSettings} from "../../../utils/staticSettings";
import {QuickStartHandler} from "../quickStartHandler";
import {NotificationFeedHandler} from "../../notifications/notificationFeedHandler";
import {NotificationConfig} from "../../notifications/notificationConfig";
import {LocalStorageKeys} from "../../../assets/localStorageKeys";
import {ReadNotifications} from "../../../components/readNotifications";
import {NotificationsCache} from "../../notifications/notificationsCache";
import {NotificationWrapper} from "../../../components/notificationWrapper";
import {QuickAccess} from "../../quickAccessHandler";
import {Checkbox, InputField, KeyInput, Label, SettingLabel} from "../../../components/components";
import hotkeys from "../../../libraries/hotkeys";
import {AnilistPaths} from "../anilistPaths";
import {FuzzyMatch} from "../../../utils/fuzzyMatch";
import {IOption} from "../../../types/settings";

export class DashboardMode {
	private static quickAccessUsers: HTMLDivElement;
	private static notificationsContainer: HTMLDivElement;

	static handleMode() {
		this.quickAccessUsers = DOM.create("div");
		this.notificationsContainer = DOM.create("div", "quick-start-notifications");

		this.handleNotifications();
		this.handleQuickAccessUsers();
		if (QuickStartHandler.config.displayAllResultsOnEmpty) {
			this.handleAnilistLinks("");
			this.handleVoidSettings("");
		}

		return [this.quickAccessUsers, this.notificationsContainer];

	}

	static handleCommand(command: string) {
		QuickStartHandler.resultsContainer.replaceChildren();
		this.handleQuickAccessUsers(command);
		this.handleNotifications(command);

		if (command.length === 0 && !QuickStartHandler.config.displayAllResultsOnEmpty) {
			return;
		}

		this.handleAnilistLinks(command);
		this.handleVoidSettings(command);
	}

	private static handleQuickAccessUsers(command?: string) {
		if (!QuickStartHandler.config.usersEnabled) {
			this.quickAccessUsers.setAttribute("void-disabled", "true");
			this.quickAccessUsers.replaceChildren();
			return;
		}
		this.quickAccessUsers.removeAttribute("void-disabled");
		this.quickAccessUsers.replaceChildren(QuickAccess.renderUsers(command));
	}


	private static handleNotifications(command?: string) {
		if (!StaticSettings.options.replaceNotifications.getValue() || !QuickStartHandler.config.notificationsEnabled) {
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

		if (QuickStartHandler.config.onlyIncludeUnreadNotifications) {
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


	private static handleAnilistLinks(command: string) {
		if (!QuickStartHandler.config.anilistLinksEnabled) {
			return;
		}
		const paths = AnilistPaths.filter(x => FuzzyMatch.match(command, x.name));
		if (paths.length > 0) {
			const pathResults = paths.map(x => {
				const link = DOM.create("a", "quick-start-result", x.name);
				link.setAttribute("href", x.path);
				link.addEventListener("click", () => {
					QuickStartHandler.closeQuickStart();
				})
				return link;
			});
			QuickStartHandler.resultsContainer.append(DOM.create("div", "quick-start-results-list", [DOM.create("h3", "quick-start-results-title", "AniList Links"), ...pathResults]));
		}
	}

	private static handleVoidSettings(command: string) {
		if (!QuickStartHandler.config.voidSettingsEnabled) {
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
								option.setValue(event.target.checked);
							})));
				}
				const input = InputField(option.getValue(), (event) => {
					option.setValue(event.target.value);
				}, "quick-access-option-input");
				return DOM.create("div", "quick-start-result", SettingLabel(option.description, input));
			});
			QuickStartHandler.resultsContainer.append(DOM.create("div", "quick-start-results-list", [DOM.create("h3", "quick-start-results-title", "VoidVerified Settings"), ...options]));
		}
	}
}
