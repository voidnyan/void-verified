export type ModeratorRole = "ADMIN" |
	"LEAD_DEVELOPER" |
	"DEVELOPER" |
	"LEAD_COMMUNITY" |
	"COMMUNITY" |
	"DISCORD_COMMUNITY" |
	"LEAD_ANIME_DATA" |
	"ANIME_DATA" |
	"LEAD_MANGA_DATA" |
	"MANGA_DATA" |
	"LEAD_SOCIAL_MEDIA" |
	"SOCIAL_MEDIA" |
	"RETIRED" |
	"CHARACTER_DATA" |
	"STAFF_DATA";

export interface IUser {
	avatar?: {
		large?: string
	},
	id?: number,
	name?: string,
	donatorTier?: number,
	donatorBadge?: string,
	moderatorRoles: ModeratorRole[]
}
