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
}
