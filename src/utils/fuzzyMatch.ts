export class FuzzyMatch {
	static match(input: string, target: string, threshold: number = 0.5): boolean {
		const lowerInput = input.toLowerCase();
		const lowerTarget = target.toLowerCase();

		if (lowerTarget.includes(lowerInput)) {
			return true;
		}

		return this.fuzzyStringMatch(lowerInput, lowerTarget, threshold);
	}

	private static fuzzyStringMatch(input: string, target: string, threshold: number = 0.3): boolean {
		const distance = this.levenshteinDistance(input, target);
		const maxLength = Math.max(input.length, target.length);
		const similarityScore = 1 - distance / maxLength;
		return similarityScore >= threshold;
	}

	private static levenshteinDistance(str1: string, str2: string): number {
		const len1 = str1.length;
		const len2 = str2.length;

		const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

		for (let i = 0; i <= len1; i++) {
			matrix[i][0] = i;
		}
		for (let j = 0; j <= len2; j++) {
			matrix[0][j] = j;
		}

		for (let i = 1; i <= len1; i++) {
			for (let j = 1; j <= len2; j++) {
				const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j - 1] + cost
				);
			}
		}

		return matrix[len1][len2];
	}
}
