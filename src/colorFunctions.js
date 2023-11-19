export class ColorFunctions {
	static hexToRgb(hex) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);

		return `${r}, ${g}, ${b}`;
	}

	static rgbToHex(rgb) {
		const [r, g, b] = rgb.split(",");
		const hex = this.generateHex(r, g, b);
		return hex;
	}

	static generateHex(r, g, b) {
		return (
			"#" +
			[r, g, b]
				.map((x) => {
					const hex = Number(x).toString(16);
					return hex.length === 1 ? "0" + hex : hex;
				})
				.join("")
		);
	}
}
