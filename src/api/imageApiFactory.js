import { CatboxAPI } from "./catboxAPI";
import { ImageHostService, imageHosts } from "./imageHostConfiguration";
import { ImgbbAPI } from "./imgbbAPI";
export class ImageApiFactory {
	getImageHostInstance() {
		const imageHostService = new ImageHostService();
		switch (imageHostService.getSelectedHost()) {
			case imageHosts.imgbb:
				return new ImgbbAPI(
					imageHostService.getImageHostConfiguration(imageHosts.imgbb)
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
