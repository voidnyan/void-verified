export class DomPurify {
	static sanitize(input: string): string {
		// @ts-ignore
		return DOMPurify.sanitize(input);
	}
}
