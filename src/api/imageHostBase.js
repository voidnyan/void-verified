export class ImageHostBase {
	conventToBase64(image) {
		return new Promise(function (resolve, reject) {
			var reader = new FileReader();
			reader.onloadend = function (e) {
				resolve({
					fileName: this.name,
					result: e.target.result,
					error: e.target.error,
				});
			};
			reader.readAsDataURL(image);
		});
	}

	async convertWebPToJpg(file, quality = 0.92) {
		if (file.type !== "image/webp") {
			return file;
		}

		const bitmap = await createImageBitmap(file);

		try {
			const canvas = document.createElement("canvas");
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;

			const ctx = canvas.getContext("2d");
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(bitmap, 0, 0);

			const blob = await new Promise((resolve, reject) => {
				canvas.toBlob(
					result => result
						? resolve(result)
						: reject(new Error("WebP to JPG conversion failed")),
					"image/jpeg",
					quality
				);
			});

			return new File(
				[blob],
				file.name.replace(/\.webp$/i, "") + ".jpg",
				{ type: "image/jpeg", lastModified: Date.now() }
			);
		} finally {
			bitmap.close();
		}
	}
}
