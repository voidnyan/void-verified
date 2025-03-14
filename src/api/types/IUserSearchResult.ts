import {ModeratorRole} from "./user";

export interface IUserSearchResult {
	id: number;
	name: string;
	avatar: {
		large: string;
	}
	moderatorRoles?: ModeratorRole[]
	bannerImage?: string;
	options?: {
		profileColor?: string;
	}
}
