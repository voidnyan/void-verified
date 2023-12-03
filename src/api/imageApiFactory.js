import { CatboxAPI } from "./catboxAPI";
import { ImageHostService, imageHosts } from "./imageHostConfiguration";
import { ImgbbAPI } from "./imgbbAPI";
import { ImgurAPI } from "./imgurAPI";
export class ImageApiFactory {
	getImageHostInstance() {
		const imageHostService = new ImageHostService();
		switch (imageHostService.getSelectedHost()) {
			case imageHosts.imgbb:
				return new ImgbbAPI(
					imageHostService.getImageHostConfiguration(imageHosts.imgbb)
				);
			case imageHosts.imgur:
				return new ImgurAPI(
					imageHostService.getImageHostConfiguration(imageHosts.imgur)
				);
			case imageHosts.catbox:
				return new CatboxAPI(
					imageHostService.getImageHostConfiguration(
						imageHosts.catbox
					)
				);
		}
	}
}
