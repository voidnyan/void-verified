export class Debouncer {
	private timer: NodeJS.Timeout | null = null;

	debounce(func: (...args: any[]) => void, delay: number, ...args: any[]) {
		// Clear the existing timer if it exists
		if (this.timer) {
			clearTimeout(this.timer);
		}

		// Set a new timer
		this.timer = setTimeout(() => {
			func(...args); // Pass the arguments to the debounced function
			this.timer = null; // Clear the timer reference after execution
		}, delay);
	}
}
