import {CollapseStatus} from "../components/collapsibleContainer";

export class CollapsibleHelper {
	private static readonly collapseDataAttribute = "void-collapsed";
	static makeCollapsible(container: HTMLElement, trigger: HTMLElement, collapseId?: string, maxHeight?: string) {
		let isCollapsed = false;
		if (collapseId) {
			isCollapsed = CollapseStatus.getIsCollapsed(collapseId);
		}

		container.setAttribute(this.collapseDataAttribute, `false`);
		container.classList.add("void-collapsible-item");

		trigger.addEventListener("click", () => {
			this.handleCollapse(container, collapseId);
		});

		trigger.classList.add("void-cursor-pointer");

		this.setMaxHeight(container, isCollapsed, maxHeight)
	}

	private static setMaxHeight(container: HTMLElement, isCollapsed: boolean, maxHeight?: string) {
		if (maxHeight) {
			container.style.setProperty("--max-height", `${maxHeight}`);
			container.classList.add("void-collapsible-item-animation");
			return;
		}

		const observer = new MutationObserver((mutationsList, observer) => {
			mutationsList.forEach(mutation => {
				mutation.addedNodes.forEach(node => {
					if (node === container || node.contains(container)) {
						const containerRect = container.getBoundingClientRect();
						container.style.setProperty("--max-height", `${containerRect.height}px`);
						container.setAttribute(this.collapseDataAttribute, `${isCollapsed}`);
						setTimeout(() => {
							container.classList.add("void-collapsible-item-animation");
						}, 300)
						observer.disconnect();
					}
				});
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}


	private static handleCollapse(container: HTMLElement, collapseId?: string) {
		const isCollapsed = !(container.getAttribute(this.collapseDataAttribute) === "true");
		if (collapseId) {
			CollapseStatus.save(collapseId, isCollapsed);
		}
		container.setAttribute(this.collapseDataAttribute, `${isCollapsed}`);
	}
}
