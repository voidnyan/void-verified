export class Common {
	static isProfile() {
		return window.location.pathname.startsWith("/user/");
	}

	static isOverview(){
		return window.location.pathname.match(/^\/user\/([^/]*)\/$/);
	}

	static getUserNameFromUrl() {
		return window.location.pathname.match(/^\/user\/([^/]*)\/?/)[1];
	}

	static waitToRender(querySelector: string, renderer: (element: Element) => void) {
		const elementToWait = document.querySelector(querySelector);
		if (!elementToWait) {
			setTimeout(() => {
				this.waitToRender(querySelector, renderer);
			}, 250);
		} else {
			renderer(elementToWait);
		}
	}

	static getTypeAndIdFromUrl(url: string): any[]{
		const match = url.match(/([^/]+)\/(\d+)/);
		if (match) {
			const type = match[1]; // "anime"
			const id = match[2];   // "180675"
			return [type.toUpperCase(), +id];
		}
		return [null, null];
	}

	static getDayDifference(date1, date2) {
		return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
	}

	static compareDates(a, b) {
		if (a > b) {
			return -1;
		} else if (a < b) {
			return 1;
		}
		return 0;
	}
}
