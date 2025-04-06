export class DomAwareComponent {
	onDomLoad(target: Node, callback: () => void) {
		const observer = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				for (const node of mutation.addedNodes) {
					if (node === target || node.contains(target)) {
						callback();
						observer.disconnect();
					}
				}
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}

	onDomUnload(target: Node, callback: () => void) {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const removedNode of mutation.removedNodes) {
					if (removedNode === target || removedNode.contains(target)) {
						callback();
						observer.disconnect();
					}
				}
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}

	addScrollListener(anchor: HTMLElement, callback: () => void) {
		const scrollContainer = this.findScrollableParent(anchor) /* || window */;
		if (scrollContainer) {
			scrollContainer.addEventListener("scroll", callback, {passive: true});
		}
		return scrollContainer;
	}

	private findScrollableParent(el: HTMLElement): HTMLElement | null {
		let parent: HTMLElement | null = el.parentElement;
		while (parent) {
			const style = getComputedStyle(parent);
			const overflowY = style.overflowY;
			if (overflowY === "auto" || overflowY === "scroll") {
				return parent;
			}
			parent = parent.parentElement;
		}
		return null;
	}
}
