export class MiniPopupHandlerBase {
	protected static container: HTMLElement;
	protected static queryInProgress = false;
	protected static isVisible = false;

	protected static initializeBase() {
		this.container.addEventListener("mouseover", () => {
			this.isVisible = true;
			this.showContainer();
		});
		this.container.addEventListener("mouseleave", () => {
			this.hideContainer();
		});
		document.body.append(this.container);
	}

	protected static addAnchorEventListeners(anchor: Element, callback: () => void) {
		anchor.addEventListener("mouseover", () => {
			this.isVisible = true;
			setTimeout(() => {
				if (!this.isVisible) {
					return;
				}
				callback();
			}, 100);
		});
		anchor.addEventListener("mouseleave", () => {
			this.hideContainer();
		});
		anchor.addEventListener("click", () => {
			this.hideContainer();
		})
	}

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

	protected static positionContainer(anchor: Element){
		const anchorRect = anchor.getBoundingClientRect();
		const containerRect = this.container.getBoundingClientRect();
		const toLeft = Math.min(30, containerRect.width / 2)

		const leftPosition = Math.min(anchorRect.left + window.scrollX - toLeft, window.innerWidth - containerRect.width - 50);
		this.container.style.left = `${leftPosition}px`;

		this.container.style.top = `${anchorRect.bottom + window.scrollY + 10}px`;
	}

	protected static setContainerMaxHeight(anchor: Element) {
		const anchorRect = anchor.getBoundingClientRect();

		this.container.style.maxHeight = window.innerHeight - anchorRect.bottom - 30 + "px";
	}
}
