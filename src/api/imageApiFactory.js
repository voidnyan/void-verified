import { CatboxAPI } from "./catboxAPI";
import { ImageHostService, imageHosts } from "./imageHostConfiguration";
import { ImgbbAPI } from "./imgbbAPI";
import { ImgurAPI } from "./imgurAPI";
export class ImageApiFactory {
	getImageHostInstance() {
		return ImageApiFactory.getImageHostInstance();
	}

	static getImageHostInstance() {
		switch (ImageHostService.getSelectedHost()) {
			case imageHosts.imgbb:
				return new ImgbbAPI(
					ImageHostService.getImageHostConfiguration(
						imageHosts.imgbb,
					),
				);
			case imageHosts.imgur:
				return new ImgurAPI(
					ImageHostService.getImageHostConfiguration(
						imageHosts.imgur,
					),
				);
			case imageHosts.catbox:
				return new CatboxAPI(
					ImageHostService.getImageHostConfiguration(
						imageHosts.catbox,
					),
				);
		}
	}
}
