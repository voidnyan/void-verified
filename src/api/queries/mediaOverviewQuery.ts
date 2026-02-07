export default `query Media($mediaId: Int, $type: MediaType) {
  Media(id: $mediaId, type: $type) {
  	id
  	type
  	isAdult
    title {
      userPreferred
      english
      native
      romaji
    }
    description
    coverImage {
      large
    }
    bannerImage
    characters(sort:[ROLE,RELEVANCE,ID]) {
      edges {
        role
        node {
          image {
            medium
          }
          id
          gender
          name {
            userPreferred
          }
        }
        voiceActorRoles(language:JAPANESE, sort:[RELEVANCE,ID]) {
          voiceActor {
            id
            image {
              medium
            }
            name {
              userPreferred
            }
          }
        }
      }
    }
    episodes
    duration
    chapters
    volumes
    averageScore
    meanScore
    relations {
      edges {
        relationType
        node {
          coverImage {
            medium
          }
          id
          title {
            userPreferred
          }
          type
          status
        }
      }
    }
    format
    genres
    status
    startDate {
      day
      month
      year
    }
    season
    seasonYear
    endDate {
      day
      month
      year
    }
    studios {
      edges {
        isMain
        node {
          name
          id
        }
      }
    }
    source
    tags {
      name
      rank
      isMediaSpoiler
      isGeneralSpoiler
    }
    staff(sort:[RELEVANCE,ID]) {
      edges {
        role
        node {
          name {
            userPreferred
          }
          id
          image {
            medium
          }
        }
      }
    }
  }
}`;

export interface IMediaOverviewQuery {
	Media: IMediaOverview;
}

export interface IMediaOverview {
	title: IMediaTitle;
	id: number;
	type: MediaType;
	isAdult: boolean;
	description: string | null;
	coverImage: ICoverImage;
	bannerImage: string | null;

	characters: ICharacterConnection;

	episodes: number | null;
	duration: number | null;
	chapters: number | null;
	volumes: number | null;

	averageScore: number | null;
	meanScore: number | null;

	relations: IRelationConnection;

	format: MediaFormat;
	genres: string[];
	status: MediaStatus;

	startDate: IFuzzyDate;
	endDate: IFuzzyDate;

	season: MediaSeason | null;
	seasonYear: number | null;

	studios: IStudioConnection;

	source: MediaSource;
	tags: IMediaTag[];
	staff: IStaffConnection;
}

/* ---------- Shared / nested types ---------- */

export interface IMediaTitle {
	userPreferred: string;
	english: string | null;
	native: string | null;
	romaji: string | null;
}

export interface ICoverImage {
	large?: string;
	medium?: string;
}

export interface IFuzzyDate {
	day: number | null;
	month: number | null;
	year: number | null;
}

/* ---------- Characters ---------- */

export interface ICharacterConnection {
	edges: ICharacterEdge[];
}

export interface ICharacterEdge {
	role: CharacterRole;
	node: ICharacter;
	voiceActorRoles: IStaffRoleType[];

}

export interface ICharacter {
	id: number;
	gender: string | null;
	image: {
		medium: string | null;
	};
	name: {
		userPreferred: string;
	};
}

export interface IStaffRoleType {
	voiceActor: IStaff;
}

export interface IStaff {
	id: number;
	image: {
		medium: string | null;
	};
	name: {
		userPreferred: string;
	};
}

/* ---------- Relations ---------- */

export interface IRelationConnection {
	edges: IRelationEdge[];
}

export interface IStaffConnection {
	edges: IStaffEdge[];
}

export interface IRelationEdge {
	relationType: MediaRelation;
	node: IRelatedMedia;
}

export interface IStaffEdge {
	role: string;
	node: IRelatedStaff;
}

export interface IRelatedStaff {
	id: number;
	name: {
		userPreferred: string;
	}
	image: {
		medium: string;
	}
}

export interface IRelatedMedia {
	id: number;
	type: MediaType;
	coverImage: {
		medium: string | null;
	};
	title: {
		userPreferred: string;
	};
	status: MediaStatus;
}

/* ---------- Studios ---------- */

export interface IStudioConnection {
	edges: IStudioEdge[];
}

export interface IStudioEdge {
	isMain: boolean;
	node: IStudio;
}

export interface IStudio {
	id: number;
	name: string;
}

/* ---------- Tags ---------- */

export interface IMediaTag {
	name: string;
	rank: number;
	isMediaSpoiler: boolean;
	isGeneralSpoiler: boolean;
}

/* ---------- Enums (from AniList schema) ---------- */

export type MediaType = "ANIME" | "MANGA";

export type MediaFormat =
	| "TV"
	| "TV_SHORT"
	| "MOVIE"
	| "SPECIAL"
	| "OVA"
	| "ONA"
	| "MANGA"
	| "NOVEL"
	| "ONE_SHOT";

export type MediaStatus =
	| "FINISHED"
	| "RELEASING"
	| "NOT_YET_RELEASED"
	| "CANCELLED"
	| "HIATUS";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type MediaSource =
	| "ORIGINAL"
	| "MANGA"
	| "LIGHT_NOVEL"
	| "VISUAL_NOVEL"
	| "VIDEO_GAME"
	| "OTHER"
	| "NOVEL"
	| "DOUJINSHI"
	| "ANIME";

export type CharacterRole = "MAIN" | "SUPPORTING" | "BACKGROUND";

export type MediaRelation =
	| "ADAPTATION"
	| "PREQUEL"
	| "SEQUEL"
	| "PARENT"
	| "SIDE_STORY"
	| "CHARACTER"
	| "SUMMARY"
	| "ALTERNATIVE"
	| "SPIN_OFF"
	| "OTHER";
