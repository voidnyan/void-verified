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
