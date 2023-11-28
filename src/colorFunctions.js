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

	static defaultColors = [
		"gray",
		"blue",
		"purple",
		"green",
		"orange",
		"red",
		"pink",
	];

	static defaultColorRgb = {
		gray: "103, 123, 148",
		blue: "61, 180, 242",
		purple: "192, 99, 255",
		green: "76, 202, 81",
		orange: "239, 136, 26",
		red: "225, 51, 51",
		pink: "252, 157, 214",
	};

	static handleAnilistColor(color) {
		if (this.defaultColors.includes(color)) {
			return this.defaultColorRgb[color];
		}

		return this.hexToRgb(color);
	}
}
