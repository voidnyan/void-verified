import {Common} from "../utils/common";
import {StaticSettings} from "../utils/staticSettings";
import {VerifiedUsers} from "../utils/verifiedUsers";
import {DOM} from "../utils/DOM";

export class ProfileHandler {
	static addVerifyButtonToProfile() {
		if (!StaticSettings.options.verifyButtonInProfile.getValue())
			return;

		const username = Common.getUserNameFromUrl();
		if (!username || username.toLowerCase() === StaticSettings.settingsInstance.anilistUser?.toLowerCase())
			return;

		let isVerified = VerifiedUsers.isVerified(username);

		const verifyButton = DOM.create("li", ".el-dropdown-menu__item", isVerified ? "Unverify" : "Verify");
		verifyButton.addEventListener("click", async () => {
			isVerified = !isVerified;
			if (isVerified) {
				await VerifiedUsers.verifyUser(username);
			} else {
				VerifiedUsers.removeUser(username);
			}
			verifyButton.replaceChildren(isVerified ? "Unverify" : "Verify");
		});

		const dropdown = document.querySelector(".banner-content .dropdown ul:not([void-verify-button='true'])");
		if (!dropdown)
			return;

		dropdown.setAttribute("void-verify-button", "true");
		dropdown.append(verifyButton);
	}
}
