export class Debouncer {
	private timer: NodeJS.Timeout | null = null;

	debounce(func: (...args: any[]) => void, delay: number, ...args: any[]) {
		if (this.timer) {
			clearTimeout(this.timer);
		}

		this.timer = setTimeout(() => {
			func(...args);
			this.timer = null;
		}, delay);
	}
}
