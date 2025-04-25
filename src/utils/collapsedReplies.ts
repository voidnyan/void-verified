interface ICollapsibleReply {
	id: number,
	isCollapsed: boolean
}

export class CollapsedComments {
	private static localStorageKey = "void-verified-collapsed-comments";

	static isCollapsed(replyId: number) {
		const replies: ICollapsibleReply[] = JSON.parse(localStorage.getItem(this.localStorageKey)) ?? [];
		const reply = replies.find(x => x.id === replyId);
		return reply?.isCollapsed;
	}

	static setIsCollapsed(replyId: number, isCollapsed: boolean) {
		const replies: ICollapsibleReply[] = JSON.parse(localStorage.getItem(this.localStorageKey)) ?? [];
		const reply = replies.find(x => x.id === replyId);
		if (!reply) {
			replies.push({
				id: replyId,
				isCollapsed: isCollapsed
			});
		} else {
			reply.isCollapsed = isCollapsed;
		}
		localStorage.setItem(this.localStorageKey, JSON.stringify(replies));
	}
}
