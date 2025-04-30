import {DOM} from "../utils/DOM";
import {ChevronDownIcon, ChevronUpIcon} from "../assets/icons";
import {LocalStorageKeys} from "../assets/localStorageKeys";

export class CollapsibleContainer {
	element: HTMLDivElement;
	head: HTMLDivElement;
	body: HTMLDivElement;
	private bodyWrap: HTMLDivElement;
	private headWrap: HTMLDivElement;
	private collapseIconContainer: HTMLDivElement;
	private isCollapsed = false;
	private readonly emptyContent;
	private collapseId?: string;
	constructor(head?: any, body?: any, classes?: {head?: string, body?: string}, emptyContent?: any, collapseId?: string) {
		this.emptyContent = emptyContent;
		this.collapseId = collapseId;
		if (this.collapseId) {
			this.isCollapsed = CollapseStatus.getIsCollapsed(this.collapseId);
		}
		this.element = DOM.create("div", "collapsible-container");

		this.createHead(head);
		this.createBody(body);

		this.element.append(this.headWrap, this.bodyWrap);

		this.setClasses(classes);
	}

	private createHead(head?: any) {
		this.head = DOM.create("div", "collapsible-container-head");
		this.collapseIconContainer = DOM.create("div", "collapsible-container-icon", ChevronDownIcon());
		this.headWrap = DOM.create("div", "collapsible-container-head-wrap");
		this.headWrap.addEventListener("click", () => {
			this.handleCollapse(!this.isCollapsed);
		})
		if (head) {
			if (head) {
				if (Array.isArray(head)) {
					this.head.append(...head);
				} else {
					this.head.append(head);
				}
			}
		}
		this.headWrap.append(this.head, this.collapseIconContainer);
	}

	private createBody(body?: any) {
		this.body = DOM.create("div", "collapsible-container-body");
		this.bodyWrap = DOM.create("div", "collapsible-container-body-wrap");
		this.bodyWrap.append(this.body);
		this.onDomLoad(body);
		if (this.isCollapsed) {
			this.handleCollapse(this.isCollapsed);
		}
	}

	handleCollapse(collapse: boolean) {
		this.isCollapsed = collapse;
		if (this.isCollapsed) {
			this.bodyWrap.classList.add("void-collapsed");
			// this.collapseIconContainer.replaceChildren(ChevronUpIcon());
		} else {
			this.bodyWrap.classList.remove("void-collapsed");
			// this.collapseIconContainer.replaceChildren(ChevronDownIcon());
		}
		if (this.collapseId) {
			CollapseStatus.save(this.collapseId, this.isCollapsed);
		}
	}

	setContent(body?: any) {
		this.body.replaceChildren();
		if (body) {
			if (Array.isArray(body)) {
				this.body.append(...body);
			} else {
				this.body.append(body);
			}
		} else if (this.emptyContent) {
			this.body.append(this.emptyContent);
		}

		const rect = this.body.getBoundingClientRect();
		this.bodyWrap.style.setProperty("--max-height", `${rect.height}px`);
	}

	private onDomLoad(body?: any) {
		if (!body && !this.emptyContent) {
			return;
		}

		const observer = new MutationObserver((mutationsList, observer) => {
			mutationsList.forEach(mutation => {
				mutation.addedNodes.forEach(node => {
					if (node === this.body || node.contains(this.body)) {
						this.setContent(body);
						observer.disconnect();
					}
				});
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}


	private setClasses(classes?: {head?: string, body?: string}) {
		if (classes?.head) {
			DOM.transformClasses(this.head, classes.head)
		}
		if (classes?.body) {
			DOM.transformClasses(this.body, classes.body)
		}
	}
}

class CollapseStatus {
	static save(collapseId: string, collapsed: boolean) {
		let collapseItems = JSON.parse(localStorage.getItem(LocalStorageKeys.collapsedContainers)) ?? [];
		if (collapseItems.find(x => x.collapseId === collapseId)) {
			collapseItems = collapseItems.map(x => x.collapseId === collapseId ? {...x, collapsed} : x);
		} else {
			collapseItems.push({collapseId, collapsed});
		}
		localStorage.setItem(LocalStorageKeys.collapsedContainers, JSON.stringify(collapseItems));
	}

	static getIsCollapsed(collapseId: string) {
		const collapsedItems = JSON.parse(localStorage.getItem(LocalStorageKeys.collapsedContainers)) ?? [];
		const isCollapsed = collapsedItems.find(x => x.collapseId === collapseId)?.collapsed ?? false;
		return isCollapsed;
	}
}
