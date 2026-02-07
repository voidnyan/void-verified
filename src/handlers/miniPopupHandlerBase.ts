export class MiniPopupHandlerBase{
	protected static container: HTMLElement;
	protected static queryInProgress = false;
	protected static isVisible = false;


	protected static showContainer(){
		if (!this.isVisible) {
			return;
		}
		this.container.classList.remove("void-mini-profile-hidden");
	}

	static hideContainer(){
		this.isVisible = false;
		setTimeout(() => {
			if (!this.isVisible) {
				this.container.classList.add("void-mini-profile-hidden");
			}
		}, 300);
	}
}
